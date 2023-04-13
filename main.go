package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"index/suffixarray"
	"io/ioutil"
	"log"
	"net/http"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	lru "github.com/hashicorp/golang-lru/v2"
	"github.com/labstack/echo/v4"
	"github.com/schollz/closestmatch"
	"github.com/texttheater/golang-levenshtein/levenshtein"
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
	
	e.Logger.Fatal(e.Start("localhost:8080"))		
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
		  return c.String(http.StatusBadRequest, "invalid page number")
		}
	
		if query == "" {
			return c.String(http.StatusBadRequest, "missing search query in URL params")
		}

		searchResults := searcher.Search(query)
		totalResults := len(searchResults)
		totalPages := (totalResults + pageSize - 1) / pageSize

		if page > totalPages {
			return c.String(http.StatusNotFound, "no more results available")
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
			return c.String(http.StatusInternalServerError, "encoding failure")
		}

		return c.JSONBlob(http.StatusOK, buf.Bytes())
	}
}

func (s *Searcher) Search(query string) []SearchResult {
	cacheKey := strings.ToLower(query)
	cacheTimeout := 5 * time.Minute
	query = cacheKey

	if value, ok := s.Cache.Get(cacheKey); ok {
		cacheEntry := value
		if time.Since(cacheEntry.Time) < cacheTimeout {
			return cacheEntry.Results
		}
	}

	const maxResults = 10
	closestQueries := s.ClosestMatch.ClosestN(query, maxResults)
	results := []SearchResult{}

	for _, closestQuery := range closestQueries {
		idxs := s.SuffixArray.Lookup([]byte(closestQuery), -1)

		for _, idx := range idxs {
			start := idx - 250
			if start < 0 {
				start = 0  // stay in bounds
			}
			end := idx + 250
			if end > len(s.CompleteWorks) {
				end = len(s.CompleteWorks) // stay in bounds
			}
			excerpt := s.CompleteWorks[start:end]

			distance := levenshtein.DistanceForStrings([]rune(query), []rune(closestQuery), levenshtein.DefaultOptions)

			result := SearchResult{
				Excerpt: excerpt,
				Match:   closestQuery,
				Weight:  distance,
			}
			results = append(results, result)
		}
	}

	sort.Slice(results, func(i, j int) bool {
		return results[i].Weight < results[j].Weight
	})

	s.Cache.Add(cacheKey, CacheEntry{
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
	s.CompleteWorksLowercase = strings.ToLower(string(dat))

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

	// Prepare closestmatch
	bagSizes := []int{2, 3, 4}
	cmBuilder := closestmatch.New(s.Words, bagSizes)
	s.ClosestMatch = cmBuilder

	return nil
}

type Searcher struct {
	CompleteWorks 				 string
	CompleteWorksLowercase string
	Words                  []string
	SuffixArray   				 *suffixarray.Index
	Cache         				 *lru.Cache[string, CacheEntry]
	ClosestMatch           *closestmatch.ClosestMatch
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
