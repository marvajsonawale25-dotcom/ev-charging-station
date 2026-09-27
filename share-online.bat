@echo off
title VoltPoint EV - Public Internet Link Generator
color 0B

echo ====================================================================
echo        VOLTPOINT EV - GENERATE PUBLIC INTERNET SHAREABLE LINK
echo ====================================================================
echo.
echo Connecting to tunnel network to generate a public link...
echo Anyone anywhere on the internet will be able to access your project!
echo.
npx localtunnel --port 5173
pause
