package main

import (
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

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

	for i, result := range results {
		if i >= 10 {
			break
		}
		t.Logf("Result %d: Excerpt: %s\n", i+1, result.Excerpt)
		t.Logf("Result %d: Match: %s\n", i+1, result.Match)
		t.Logf("Result %d: Weight: %d\n", i+1, result.Weight)
	}
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
