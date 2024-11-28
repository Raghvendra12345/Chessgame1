const express=require("express")
const socket=require("socket.io")
const http=require("http")
const {Chess}=require("chess.js")
const path=require("path")

const app=express();

const server=http.createServer(app)
const io=socket(server)

const chess=new Chess();
let players={}
let currentPlayer="w"


app.set("view engine","ejs")
app.use(express.static(path.join(__dirname,"public")))

app.get("/",(req,res)=>{
    res.render("index",{title:"Chess Game"})
})

//ye hi functionality decide karta hai ki kitne logg ko connection karwaye
io.on("connection",function(uniquesocket){
    console.log("connected")
     
      //ye dekhta hai ki agar koi player game mai aata hai toh white team assign kare aur phir black team assign kare
      if(!players.white){
        players.white=uniquesocket.id;
        uniquesocket.emit("playerRole","w")
      }
      else if(!players.black){
        players.black=uniquesocket.id;
        uniquesocket.emit("playerRole","b")
      }
      else{
           uniquesocket.emit("spectatorRole")
      }

      //agar koi game chor de ya disconnect ho jaye expect spectator
      uniquesocket.on("disconnect",function(){
        if(uniquesocket.id===players.white){
            delete players.white
        }
        else if(uniquesocket.id===players.black){
            delete players.black
        }
      })
      
    //   ye decide karta hai ki move jo chal rahe ho valid hai ya nahi
      uniquesocket.on("move",(move)=>{
        //try and catch function rakho nahi toh server crash ho jayega
        try{
            if(chess.turn()==="b" && uniquesocket.id!=players.black) return;
            if(chess.turn()==="w" && uniquesocket.id!=players.white) return;

            const result=chess.move(move)
            if(result){
                currentPlayer=chess.turn();

                //io.emit matlab ab hm frontend pe bhej rahe hai sabko ye move
                io.emit("move",move)

                // ye board ka current state bhejata hai connection ko
                io.emit("boardState",chess.fen())
            }
            else{
                console.log("Invalid move:",move)
                uniquesocket.emit("invalidMove",move)
            }

        }
        catch(err){
            console.log(err)
           uniquesocket.emit("Invalid move:",move)
        }
      })
    ///for making connection
    // uniquesocket.on("churan",function(){
    //     // console.log("churan received")
    //     io.emit("churan paapdi")
    // })

     ///for making disconnection
    //  uniquesocket.on("disconnect",function(){
    //     console.log("disconnected")
    //  })

    // uniquesocket.on("")
})
server.listen(3000,function(){
    console.log("listening on port at 3000")
})