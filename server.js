// server.js
// RUN COMMAND: deno run --allow-read --allow-net --watch server.js
// import public module from deno.land
// at deno, can be imported directly using url
import { serveDir } from "https://deno.land/std@0.223.0/http/file_server.ts";

// save the previous word
let previousWord = "しりとり";
let brain = ["しりとり"];
//brain.push(previousWord);

// local hostにDenoのHTTPサーバーを展開
Deno.serve(async (request) =>{
    // get path name
    // if connected to http://localhost:8000/hoge, return "/hoge"
    const pathname = new URL(request.url).pathname;
    console.log(`pathname: ${pathname}`);

    // GET /shiritori: return the previous word
    if(request.method == "GET" && pathname === "/shiritori"){
        return new Response(previousWord);
    }

    if(request.method == "WORD" && pathname === "/shiritori"){
        return new Response(brain);
    }

    // POST /shiritori: input(enter) the next word
    if(request.method == "POST" && pathname === "/shiritori"){
        // get request's payload
        const requestJson = await request.json();
        // get word from JSON
        const nextWord = requestJson["nextWord"];

        // check if the last letter of previous word and the first letter of the next word are the same
        if(previousWord.slice(-1) === nextWord.slice(0, 1)){
            // if same, update previousWord
            if(brain.includes(nextWord) === true){
                return new Response(
                    JSON.stringify({
                        "errorMessage": "同じ単語を検出しました",
                        "errorCode": "10001"
                    }),
                    {
                        status: 401,
                        headers: {"Content-Type": "application/json; charset=utf-8"},
                    }
                );
            }else if(nextWord.slice(-1) === "ん"){
                return new Response(
                    JSON.stringify({
                        "errorMessage": "“ん”で終わってしまった\nゲームをリセットします!",
                        "errorCode": "10001"
                    }),
                    {
                        status: 402,
                        headers: {"Content-Type": "application/json; charset=utf-8"},
                    }
                );
            }else{
                previousWord = nextWord;    // only update if nextWord wasn't in "brain"
            }
        // when wrong, return error
        }else{
            return new Response(
                JSON.stringify({
                    "errorMessage": "前の単語に続いていません",
                    "errorCode": "10001"
                }),
                {
                    status: 400,
                    headers: {"Content-Type": "application/json; charset=utf-8"},
                }
            );
        }
        brain.push(previousWord);
        // return current word
        return new Response(previousWord);
    }

    if(request.method == "POST" && pathname === "/reset"){
        previousWord = "しりとり";
        brain = ["しりとり"]; // clear the "brain" array
        nextWord = requestJson["nextWord"];
    }
    
    // make ./pulbic 's file public
    return serveDir(
        request,
        {
            /*
            - fsRoot: assign which folder to public
            -urlRoot: assign the url which expands the folder. Expand into localhost:8000/ directly

            -enableCors: whether or not to add settings to CORS
            */
           fsRoot: "./public",
           urlRoot: "",
           enableCors: true,
        }
    );
});