#!/usr/bin/sh

cd client && yarn dev:go & air server --port 3023 && fg
