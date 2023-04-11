package client

import (
	"embed"

	"github.com/labstack/echo/v4"
)

var (
    dist embed.FS
    indexHTML     embed.FS
    distDirFS     = echo.MustSubFS(dist, "dist")
    distIndexHtml = echo.MustSubFS(indexHTML, "dist")
) 

func RegisterHandlers(e *echo.Echo) {
    e.FileFS("/", "index.html", distIndexHtml)
    e.StaticFS("/", distDirFS)
}