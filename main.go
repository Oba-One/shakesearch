package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"index/suffixarray"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"
	"unicode"

	lru "github.com/hashicorp/golang-lru/v2"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/lithammer/fuzzysearch/fuzzy"
)

func main() {
	searcher := Searcher{}
	err := searcher.Load("completeworks.txt")
	if err != nil {
		log.Fatal(err)
	}
	
	
	e := echo.New()
	
	e.Static("/", "client/dist")
	e.GET("/status", func(c echo.Context) error {
		return c.String(http.StatusOK, "Everything quiet over here.")
	})
	e.GET("/search", handleSearch(searcher))

	err = godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading environment variables file")
	}

	host := os.Getenv("API_HOST")
	e.Logger.Fatal(e.Start(host))		
}

const pageSize = 20

func handleSearch(searcher Searcher) echo.HandlerFunc {
	return func(c echo.Context) error {
		query := c.QueryParam("q")
		pageParam := c.QueryParam("page")
		page, err := strconv.Atoi(pageParam)
		if err != nil {
			page = 1
		}

		if page < 1 {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid page number"})
		}

		if query == "" {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing search query in URL params"})
		}

		searchResults := searcher.Search(query)

		if len(searchResults) == 0 {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "No results found"})
		}

		totalResults := len(searchResults)
		totalPages := (totalResults + pageSize - 1) / pageSize

		if page > totalPages {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "No more results available"})
		}

		start := (page - 1) * pageSize
		end := start + pageSize
		if end > totalResults {
			end = totalResults
		}

		paginatedResults := searchResults[start:end]

		buf := &bytes.Buffer{}
		enc := json.NewEncoder(buf)
		err = enc.Encode(paginatedResults)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Encoding failure"})
		}

		return c.JSONBlob(http.StatusOK, buf.Bytes())
	}
}

func (s *Searcher) Search(q string) []SearchResult {
	query := preprocessText(q)
	cacheTimeout := 5 * time.Minute

	if value, ok := s.Cache.Get(query); ok {
		cacheEntry := value
		if time.Since(cacheEntry.Time) < cacheTimeout {
			return cacheEntry.Results
		}
	}

	results := []SearchResult{}
	uniqueMatches := make(map[string]struct{})

	// Search for the entire query (exact match)
	idxs := s.SuffixArray.Lookup([]byte(query), -1)
	findMatches(query, idxs, s.CompleteWorks, 0, &results, uniqueMatches)

	// Search for fuzzy matches
	distanceThreshold := int(float64(len(query)) * 0.2)
	fuzzyMatches := fuzzy.RankFind(query, s.Words)
	for _, match := range fuzzyMatches {
		distance := match.Distance

		// Skip results that exceed the distance threshold
		if distance > distanceThreshold {
			continue
		}

		phrase := match.Target
		idxs := s.SuffixArray.Lookup([]byte(phrase), -1)
		findMatches(phrase, idxs, s.CompleteWorks, distance, &results, uniqueMatches)
	}

	sort.Slice(results, func(i, j int) bool {
		return results[i].Weight < results[j].Weight
	})

	s.Cache.Add(query, CacheEntry{
		Results: results,
		Time:    time.Now(),
	})

	return results
}

func (s *Searcher) Load(filename string) error {
    dat, err := ioutil.ReadFile(filename)
    if err != nil {
        return fmt.Errorf("Load: %w", err)
    }

    s.CompleteWorks = string(dat)
    s.CompleteWorksLowercase = preprocessText(s.CompleteWorks)

    // Create a list of lowercase words
    wordPattern := regexp.MustCompile(`\w+`)
    words := wordPattern.FindAllString(s.CompleteWorksLowercase, -1)
    s.Words = words

    s.SuffixArray = suffixarray.New([]byte(s.CompleteWorksLowercase))

    cacheSize := 100
    cache, err := lru.New[string, CacheEntry](cacheSize)
    if err != nil {
        return fmt.Errorf("Load: %w", err)
    }
    s.Cache = cache

    return nil
}

func findMatches(query string, idxs []int, completeWorks string, distance int, results *[]SearchResult, uniqueMatches map[string]struct{}) {
	for _, idx := range idxs {
		start := idx - 250
		if start < 0 {
			start = 0 // stay in bounds
		}
		end := idx + 250
		if end > len(completeWorks) {
			end = len(completeWorks) // stay in bounds
		}
		excerpt := completeWorks[start:end]

		if _, exists := uniqueMatches[excerpt]; !exists {
			uniqueMatches[excerpt] = struct{}{}
			result := SearchResult{
				Excerpt: excerpt,
				Match:   query,
				Weight:  distance,
			}
			*results = append(*results, result)
		}
	}
}

func preprocessText(text string) string {
    text = strings.Map(func(r rune) rune {
        if unicode.IsPunct(r) {
            return -1
        }
        return r
    }, text)
    text = strings.ToLower(text)
    text = strings.Join(strings.Fields(text), " ")

    return text
}

type Searcher struct {
	CompleteWorks 				 string
	CompleteWorksLowercase string
	Words                  []string
	SuffixArray   				 *suffixarray.Index
	Cache         				 *lru.Cache[string, CacheEntry]
}

type SearchResult struct {
    Excerpt string `json:"excerpt"`
		Match   string `json:"match"`
    Weight  int    `json:"weight"`
}

type CacheEntry struct {
    Results []SearchResult
    Time    time.Time
}
