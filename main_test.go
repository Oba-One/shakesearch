package main

import (
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strconv"
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
	assert.NotNil(t, searcher.ClosestMatch)
}

func TestLoadInvalidFile(t *testing.T) {
	searcher := Searcher{}
	err := searcher.Load("invalidfilename.txt")
	assert.Error(t, err)
}

func TestSearch(t *testing.T) {
	searcher := Searcher{}
	err := searcher.Load("completeworks.txt")
	if err != nil {
		log.Fatal(err)
	}

	results := searcher.Search("hamlet")
	assert.True(t, len(results) > 0)
}

func TestCache(t *testing.T) {
	searcher := Searcher{}
	err := searcher.Load("completeworks.txt")
	if err != nil {
		log.Fatal(err)
	}

	results1 := searcher.Search("macbeth")
	time.Sleep(1 * time.Second)
	results2 := searcher.Search("macbeth")

	assert.Equal(t, len(results1), len(results2), "Results should be equal when fetched from cache")
}

func TestEmptyQuery(t *testing.T) {
	searcher := Searcher{}
	err := searcher.Load("completeworks.txt")
	if err != nil {
		log.Fatal(err)
	}

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/search?", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handleSearch(searcher)(c)

	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func TestHamletSearch(t *testing.T) {
	searcher := Searcher{}
	err := searcher.Load("completeworks.txt")
	if err != nil {
		log.Fatal(err)
	}

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
	err = json.Unmarshal(rec.Body.Bytes(), &results)
	assert.NoError(t, err, "Failed to parse response JSON")

	assert.True(t, len(results) > 0, "Expected at least one search result")
}

func TestMacbethSearch(t *testing.T) {
	searcher := Searcher{}
	err := searcher.Load("completeworks.txt")
	if err != nil {
		log.Fatal(err)
	}

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
	err = json.Unmarshal(rec.Body.Bytes(), &results)
	assert.NoError(t, err, "Failed to parse response JSON")

	assert.True(t, len(results) > 0, "Expected at least one search result")
}
	
func TestThouSearch(t *testing.T) {
	searcher := Searcher{}
	err := searcher.Load("completeworks.txt")
	if err != nil {
		log.Fatal(err)
	}

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
	err = json.Unmarshal(rec.Body.Bytes(), &results)
	assert.NoError(t, err, "Failed to parse response JSON")

	assert.True(t, len(results) > 0, "Expected at least one search result")
}

func TestUpperCaseHamLetSearch(t *testing.T) {
	searcher := Searcher{}
	err := searcher.Load("completeworks.txt")
	if err != nil {
		log.Fatal(err)
	}

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
	err = json.Unmarshal(rec.Body.Bytes(), &results)
	assert.NoError(t, err, "Failed to parse response JSON")

	assert.True(t, len(results) > 0, "Expected at least one search result")
}

func TestMispellingSearch(t *testing.T) {
	searcher := Searcher{}
	err := searcher.Load("completeworks.txt")
	if err != nil {
		log.Fatal(err)
	}

	e := echo.New()
	q := make(url.Values)
	q.Set("q", "macbetg")
	req := httptest.NewRequest(http.MethodGet, "/search?" + q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

  handleSearch(searcher)(c)
	t.Log(rec.Body.String())

	assert.Equal(t, http.StatusOK, rec.Code)

	contentType := rec.Header().Get("Content-Type")
	assert.Equal(t, "application/json; charset=UTF-8", contentType)

	var results []SearchResult
	err = json.Unmarshal(rec.Body.Bytes(), &results)
	assert.NoError(t, err, "Failed to parse response JSON")

	assert.True(t, len(results) > 0, "Expected at least one search result")
}

func TestSpecialCharactersSearch(t *testing.T) {
	searcher := Searcher{}
	err := searcher.Load("completeworks.txt")
	if err != nil {
		log.Fatal(err)
	}

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
	err = json.Unmarshal(rec.Body.Bytes(), &results)
	assert.NoError(t, err, "Failed to parse response JSON")

	assert.True(t, len(results) > 0, "Expected at least one search result")
}

func TestNoMoreResultsAvailable(t *testing.T) {
	searcher := Searcher{}
	err := searcher.Load("completeworks.txt")
	if err != nil {
		log.Fatal(err)
	}

	e := echo.New()
	q := make(url.Values)
	q.Set("q", "hamlet")
	q.Set("page", "999999")
	req := httptest.NewRequest(http.MethodGet, "/search?" + q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handleSearch(searcher)(c)

	assert.Equal(t, http.StatusNotFound, rec.Code)
	assert.Equal(t, "no more results available", strings.TrimSpace(rec.Body.String()))
}

func TestPagination(t *testing.T) {
	searcher := Searcher{}
	err := searcher.Load("completeworks.txt")
	if err != nil {
		log.Fatal(err)
	}

	e := echo.New()
	q := make(url.Values)
	q.Set("q", "romeo")
	q.Set("page", "2")
	req := httptest.NewRequest(http.MethodGet, "/search?" + q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handleSearch(searcher)(c)

	assert.Equal(t, http.StatusOK, rec.Code)

	var results []SearchResult
	err = json.Unmarshal(rec.Body.Bytes(), &results)
	assert.NoError(t, err)

	assert.Equal(t, pageSize, len(results))
}

func TestNegativePageNumber(t *testing.T) {
	searcher := Searcher{}
	err := searcher.Load("completeworks.txt")
	if err != nil {
		log.Fatal(err)
	}

	e := echo.New()
	q := make(url.Values)
	q.Set("q", "hamlet")
	q.Set("page", "-1")
	req := httptest.NewRequest(http.MethodGet, "/search?" + q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handleSearch(searcher)(c)

	assert.Equal(t, http.StatusBadRequest, rec.Code)
	assert.Equal(t, "invalid page number", strings.TrimSpace(rec.Body.String()))
}

func TestZeroPageNumber(t *testing.T) {
	searcher := Searcher{}
	err := searcher.Load("completeworks.txt")
	if err != nil {
		log.Fatal(err)
	}

	e := echo.New()
	q := make(url.Values)
	q.Set("q", "hamlet")
	q.Set("page", "0")
	req := httptest.NewRequest(http.MethodGet, "/search?" + q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handleSearch(searcher)(c)

	assert.Equal(t, http.StatusBadRequest, rec.Code)
	assert.Equal(t, "invalid page number", strings.TrimSpace(rec.Body.String()))
}

func TestLastPage(t *testing.T) {
	searcher := Searcher{}
	err := searcher.Load("completeworks.txt")
	if err != nil {
		log.Fatal(err)
	}

	searchResults := searcher.Search("hamlet")
	totalResults := len(searchResults)
	totalPages := (totalResults + pageSize - 1) / pageSize

	e := echo.New()
	q := make(url.Values)
	q.Set("q", "hamlet")
	q.Set("page", strconv.Itoa(totalPages)) // Set the page number to the last page
	req := httptest.NewRequest(http.MethodGet, "/search?" + q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handleSearch(searcher)(c)
	t.Log(rec.Body.String())

	assert.Equal(t, http.StatusOK, rec.Code)

	contentType := rec.Header().Get("Content-Type")
	assert.Equal(t, "application/json; charset=UTF-8", contentType)

	var results []SearchResult
	err = json.Unmarshal(rec.Body.Bytes(), &results)
	assert.NoError(t, err, "Failed to parse response JSON")

	assert.True(t, len(results) > 0, "Expected at least one search result")
}
