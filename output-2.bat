7z a -tzip "output.zip" "output.html"

advzip -z -4 -i 5 output.zip

timeout 1

pause

::inliner -m index.html > output.html
::pause