copy src\tomato.js+src\matter.js+src\zzfx.js+shapes.js+game.js /b combined.js

java -jar cl.jar --js combined.js --js_output_file output.js --compilation_level ADVANCED_OPTIMIZATIONS
::SIMPLE_OPTIMIZATIONS
::ADVANCED_OPTIMIZATIONS

pause

inliner -m "index.html" > "output.html"