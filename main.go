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

	lru "github.com/hashicorp/golang-lru/v2"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
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
const	cacheTimeout = 5 * time.Minute

func handleSearch(searcher Searcher) echo.HandlerFunc {
	return func(c echo.Context) error {
		query := c.QueryParam("q")

		if len(query) < 1 || len(query) > 1000 {
    	return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid query length"})
		}

		var validChars = regexp.MustCompile(`^[a-zA-Z0-9\s.,;:!?'-]+$`)

		if !validChars.MatchString(query) {
				return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid characters in query"})
		}

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
			return c.JSON(http.StatusOK, map[string]string{"error": "No more results available"})
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
	query := strings.ToLower(q)

	// CHECK CACHE
	if value, ok := s.Cache.Get(query); ok {
		cacheEntry := value
		if time.Since(cacheEntry.Time) < cacheTimeout {
			return cacheEntry.Results
		}
	}

	results := []SearchResult{}
	uniqueMatches := make(map[string]struct{})

	// FIND EXACT MATCHES
	idxs := s.SuffixArray.Lookup([]byte(query), -1)
	findMatches(query, idxs, s.CompleteWorks, 0, &results, uniqueMatches)

	// FIND FUZZY MATCHES
	// fuzzyMatches := fuzzy.RankFindFold(query, s.Words)
	// for _, match := range fuzzyMatches {
	// 	phrase := match.Target
	// 	idxs := s.SuffixArray.Lookup([]byte(phrase), -1)
	// 	findMatches(phrase, idxs, s.CompleteWorks, match.Distance, &results, uniqueMatches)
	// }

	// SORT RESULTS
	sort.Slice(results, func(i, j int) bool {
		return results[i].Weight < results[j].Weight
	})

	// CACHE RESULTS
	s.Cache.Add(query, CacheEntry{
		Results: results,
		Time:    time.Now(),
	})

	return results
}

func (s *Searcher) Load(filename string) error {
		// LOAD SHAKESPEARE'S WORKS
    dat, err := ioutil.ReadFile(filename)
    if err != nil {
        return fmt.Errorf("Load: %w", err)
    }

		// PREPROCESS WORKS
    s.CompleteWorks = string(dat)
    s.CompleteWorksLowercase = strings.ToLower(s.CompleteWorks)
    wordPattern := regexp.MustCompile(`\w+`)
    words := wordPattern.FindAllString(s.CompleteWorksLowercase, -1)
    s.Words = words
    s.SuffixArray = suffixarray.New([]byte(s.CompleteWorksLowercase))

		// INITIALIZE CACHE
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
