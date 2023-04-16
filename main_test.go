package main

import (
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestLoad(t *testing.T) {
	searcher := Searcher{}
	err := searcher.Load("completeworks.txt")
	assert.NoError(t, err)
	assert.NotNil(t, searcher.SuffixArray)
	assert.NotNil(t, searcher.Cache)
	assert.NotNil(t, searcher.Words)
	assert.NotNil(t, searcher.CompleteWorks)
	assert.NotNil(t, searcher.CompleteWorksLowercase)
}

func TestLoadInvalidFile(t *testing.T) {
	searcher := Searcher{}
	err := searcher.Load("invalidfilename.txt")
	assert.Error(t, err)
}

func TestSearch(t *testing.T) {
	searcher := setupSearcher()

	results := searcher.Search("hamlet")
	assert.True(t, len(results) > 0)
}

func TestCache(t *testing.T) {
	searcher := setupSearcher()

	results1 := searcher.Search("macbeth")
	time.Sleep(1 * time.Second)
	results2 := searcher.Search("macbeth")

	assert.Equal(t, len(results1), len(results2), "Results should be equal when fetched from cache")
}

func TestEmptyQuery(t *testing.T) {
	searcher := setupSearcher()

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/search?", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handleSearch(searcher)(c)

	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func TestHamletSearch(t *testing.T) {
	searcher := setupSearcher()

	e := echo.New()
	q := make(url.Values)
	q.Set("q", "hamlet")
	req := httptest.NewRequest(http.MethodGet, "/search?" + q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

  handleSearch(searcher)(c)
	t.Log(rec.Body.String())

	assert.Equal(t, http.StatusOK, rec.Code)

	contentType := rec.Header().Get("Content-Type")
	assert.Equal(t, "application/json; charset=UTF-8", contentType)

	var results []SearchResult
	err := json.Unmarshal(rec.Body.Bytes(), &results)
	assert.NoError(t, err, "Failed to parse response JSON")

	assert.True(t, len(results) > 0, "Expected at least one search result")
}

func TestMacbethSearch(t *testing.T) {
	searcher := setupSearcher()

	e := echo.New()
	q := make(url.Values)
	q.Set("q", "macbeth")
	req := httptest.NewRequest(http.MethodGet, "/search?" + q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

  handleSearch(searcher)(c)
	t.Log(rec.Body.String())

	assert.Equal(t, http.StatusOK, rec.Code)

	contentType := rec.Header().Get("Content-Type")
	assert.Equal(t, "application/json; charset=UTF-8", contentType)

	var results []SearchResult
	err := json.Unmarshal(rec.Body.Bytes(), &results)
	assert.NoError(t, err, "Failed to parse response JSON")

	assert.True(t, len(results) > 0, "Expected at least one search result")
}
	
func TestThouSearch(t *testing.T) {
	searcher := setupSearcher()

	e := echo.New()
	q := make(url.Values)
	q.Set("q", "thou")
	req := httptest.NewRequest(http.MethodGet, "/search?" + q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

  handleSearch(searcher)(c)
	t.Log(rec.Body.String())

	assert.Equal(t, http.StatusOK, rec.Code)

	contentType := rec.Header().Get("Content-Type")
	assert.Equal(t, "application/json; charset=UTF-8", contentType)

	var results []SearchResult
	err := json.Unmarshal(rec.Body.Bytes(), &results)
	assert.NoError(t, err, "Failed to parse response JSON")

	assert.True(t, len(results) > 0, "Expected at least one search result")
}

func TestHorseSearch(t *testing.T) {
	searcher := setupSearcher()

	e := echo.New()
	q := make(url.Values)
	query := "A horse! A horse!"
	q.Set("q", query)
	req := httptest.NewRequest(http.MethodGet, "/search?" + q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handleSearch(searcher)(c)
	t.Log(rec.Body.String())

	assert.Equal(t, http.StatusOK, rec.Code)

	contentType := rec.Header().Get("Content-Type")
	assert.Equal(t, "application/json; charset=UTF-8", contentType)

	var results []SearchResult
	err := json.Unmarshal(rec.Body.Bytes(), &results)
	assert.NoError(t, err, "Failed to parse response JSON")
	assert.True(t, len(results) == 2, "Expected 2 search results")

	// Check if the query exists in the results
	queryExists := false
	queryLower := strings.ToLower(query)
	for _, result := range results {
		matchLower := strings.ToLower(result.Match)
		excerptLower := strings.ToLower(result.Excerpt)

		if strings.Contains(matchLower, queryLower) || strings.Contains(excerptLower, queryLower) {
			queryExists = true
			break
		}
	}
	assert.True(t, queryExists, "Query not found in the search results")
}

// Add for different puncutations
func TestToBeOrNotToBeSearch(t *testing.T) {
	searcher := setupSearcher()

	e := echo.New()
	q := make(url.Values)
	q.Set("q", "To be, or not to be, that is the question")
	req := httptest.NewRequest(http.MethodGet, "/search?" + q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

  handleSearch(searcher)(c)
	t.Log(rec.Body.String())

	assert.Equal(t, http.StatusOK, rec.Code)

	contentType := rec.Header().Get("Content-Type")
	assert.Equal(t, "application/json; charset=UTF-8", contentType)

	var results []SearchResult
	err := json.Unmarshal(rec.Body.Bytes(), &results)
	assert.NoError(t, err, "Failed to parse response JSON")
	assert.True(t, len(results) == 1, "Expected 2 search result")
}

func TestUpperCaseHamLetSearch(t *testing.T) {
	searcher := setupSearcher()

	e := echo.New()
	q := make(url.Values)
	q.Set("q", "HamLet")
	req := httptest.NewRequest(http.MethodGet, "/search?" + q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

  handleSearch(searcher)(c)
	t.Log(rec.Body.String())

	assert.Equal(t, http.StatusOK, rec.Code)

	contentType := rec.Header().Get("Content-Type")
	assert.Equal(t, "application/json; charset=UTF-8", contentType)

	var results []SearchResult
	err := json.Unmarshal(rec.Body.Bytes(), &results)
	assert.NoError(t, err, "Failed to parse response JSON")

	assert.True(t, len(results) > 0, "Expected at least one search result")
}

// Fix kind of determine mispelling
func TestMispellingSearch(t *testing.T) {
	searcher := setupSearcher()

	e := echo.New()
	q := make(url.Values)
	q.Set("q", "macbth")
	req := httptest.NewRequest(http.MethodGet, "/search?" + q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

  handleSearch(searcher)(c)
	t.Log(rec.Body.String())

	assert.Equal(t, http.StatusOK, rec.Code)

	contentType := rec.Header().Get("Content-Type")
	assert.Equal(t, "application/json; charset=UTF-8", contentType)

	var results []SearchResult
	err := json.Unmarshal(rec.Body.Bytes(), &results)
	assert.NoError(t, err, "Failed to parse response JSON")

	assert.True(t, len(results) > 0, "Expected at least one search result")
}

func TestSpecialCharactersSearch(t *testing.T) {
	searcher := setupSearcher()

	e := echo.New()
	q := make(url.Values)
	q.Set("q", "love's")
	req := httptest.NewRequest(http.MethodGet, "/search?" + q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handleSearch(searcher)(c)
	t.Log(rec.Body.String())

	assert.Equal(t, http.StatusOK, rec.Code)

	contentType := rec.Header().Get("Content-Type")
	assert.Equal(t, "application/json; charset=UTF-8", contentType)

	var results []SearchResult
	err := json.Unmarshal(rec.Body.Bytes(), &results)
	assert.NoError(t, err, "Failed to parse response JSON")

	assert.True(t, len(results) > 0, "Expected at least one search result")
}

func TestNoMoreResultsAvailable(t *testing.T) {
	searcher := setupSearcher()

	e := echo.New()
	q := make(url.Values)
	q.Set("q", "hamlet")
	q.Set("page", "999999")
	req := httptest.NewRequest(http.MethodGet, "/search?" + q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handleSearch(searcher)(c)

	var jsonResponse map[string]string
	err := json.Unmarshal(rec.Body.Bytes(), &jsonResponse)
	if err != nil {
		t.Fatalf("Failed to unmarshal JSON: %v", err)
	}

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "No more results available", jsonResponse["error"])
}

func TestNoResultsFound(t *testing.T) {
	searcher := setupSearcher()

	e := echo.New()
	q := make(url.Values)
	q.Set("q", "ghjtls")
	q.Set("page", "1")
	req := httptest.NewRequest(http.MethodGet, "/search?" + q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handleSearch(searcher)(c)

	var jsonResponse map[string]string
	err := json.Unmarshal(rec.Body.Bytes(), &jsonResponse)
	if err != nil {
		t.Fatalf("Failed to unmarshal JSON: %v", err)
	}

	assert.Equal(t, http.StatusNotFound, rec.Code)
	assert.Equal(t, "No results found", jsonResponse["error"])
}

func TestNegativePageNumber(t *testing.T) {
	searcher := setupSearcher()

	e := echo.New()
	q := make(url.Values)
	q.Set("q", "hamlet")
	q.Set("page", "-1")
	req := httptest.NewRequest(http.MethodGet, "/search?" + q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handleSearch(searcher)(c)

	var jsonResponse map[string]string
	err := json.Unmarshal(rec.Body.Bytes(), &jsonResponse)
	if err != nil {
		t.Fatalf("Failed to unmarshal JSON: %v", err)
	}

	assert.Equal(t, http.StatusBadRequest, rec.Code)
	assert.Equal(t, "Invalid page number", jsonResponse["error"])
}

func TestZeroPageNumber(t *testing.T) {
	searcher := setupSearcher()

	e := echo.New()
	q := make(url.Values)
	q.Set("q", "hamlet")
	q.Set("page", "0")
	req := httptest.NewRequest(http.MethodGet, "/search?" + q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handleSearch(searcher)(c)

	var jsonResponse map[string]string
	err := json.Unmarshal(rec.Body.Bytes(), &jsonResponse)
	if err != nil {
		t.Fatalf("Failed to unmarshal JSON: %v", err)
	}

	assert.Equal(t, http.StatusBadRequest, rec.Code)
	assert.Equal(t, "Invalid page number", jsonResponse["error"])
}

func setupSearcher() Searcher {
	searcher := Searcher{}
	err := searcher.Load("completeworks.txt")
	if err != nil {
		log.Fatal(err)
	}
	return searcher
}
