// Note:
// ye ek fronted hai aur jab ye run hoga toh backend ko request bheje ga 
// aur jab tum localhost server se connect hoge tab tumko connected dikhe ga
// aur tum bhot server pe ek sath connect ho sakte ho aur ye connected dikhayega aur live time pe samjhe mere sher 
// ha ha ha ha ha ha ha
const socket=io();
const chess=new Chess();
const boardElement=document.querySelector(".chessboard")

let draggedPiece=null;
let sourceSquare=null;
let playerRole=null;

const renderBoard=()=>{
    const board=chess.board();
    boardElement.innerHTML="";
    board.forEach((row,rowindex)=>{
        // console.log(row,rowindex)
        row.forEach((square,squareindex)=>{
            // console.log(square)//
            const squareElement=document.createElement("div");
            squareElement.classList.add(
                "square",
                (rowindex+squareindex) % 2===0 ? "Light" : "dark"
            );
            squareElement.dataset.row=rowindex;
            squareElement.dataset.col=squareindex   

            if(square){
                const pieceElement=document.createElement("div");
                pieceElement.classList.add(
                    "piece",
                    square.color ==="w" ? "white" :"black"
                );
                pieceElement.innerHTML=getPieceUnicode(square);
                pieceElement.draggable=playerRole===square.color;
                pieceElement.addEventListener("dragstart",(e)=>{
                    if(pieceElement.draggable){
                        draggedPiece=pieceElement;
                        sourceSquare={row: rowindex , col:squareindex}
                        e.dataTransfer.setData("text/plain","")
                    }
                });
                pieceElement.addEventListener("dragend",(e)=>{
                      draggedPiece="null";
                      sourceSquare="null";
                })
                squareElement.appendChild(pieceElement)
            }
            squareElement.addEventListener("dragover",function(e) {
               e.preventDefault(); 
            })
            squareElement.addEventListener("drop",function(e){
                e.preventDefault();
                if(draggedPiece){
                    const targetSource={
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    }
                    handleMove(sourceSquare,targetSource)
                }
            })
            boardElement.appendChild(squareElement)
        });
        
    })
    if(playerRole==="b"){
        boardElement.classList.add("flipped")
    }
    else{
        boardElement.classList.remove("flipped")
    }
    // console.log(board)
}
// const handleMove=(source,target)=>{
//     const move={
//         from:`${String.fromCharCode(97+source.col)}${8-source.row}`,
//         to: `${String.fromCharCode(97+target.col)}${8-target.row}`,
//         promotion: "q"
//     }
//     socket.emit("move",move)
// }
const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`
    };

    // Check if the piece being moved is a pawn and if it reaches the last rank
    const piece = chess.get(move.from); // Get the piece at the source square
    if (piece && piece.type === 'p' && (move.to[1] === '1' || move.to[1] === '8')) {
        move.promotion = 'q';  // Auto-promote to queen
    }

    socket.emit("move", move);
};

const getPieceUnicode=(piece)=>{
    const unicodePieces = {
        p: "♟",
        r: "♜",
        n: "♞",
        b: "♝",
        q: "♛",
        k: "♚",
        P:  "♙",
        R:  "♖",
        N:  "♘",
        B:  "♗",
        Q:  "♕",
        K: "♔",
    }
    return unicodePieces[piece.type] || "";
}

socket.on("playerRole",function(role){
    playerRole=role;
    renderBoard();
})

socket.on("spectatorRole",function(){
    playerRole=null;
    renderBoard();
})

socket.on("boardState",function(fen){
    chess.load(fen);
    renderBoard();
})

socket.on("move",function(move){
    chess.move(move);
    renderBoard();
})

renderBoard();

// when member join the group then this work
// socket.emit("churan")
// socket.on("churan paapdi",function(){
//     console.log("churan paapdi received")
// })
