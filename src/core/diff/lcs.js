
// refer :
// https://www.ibm.com/developerworks/cn/java/j-seqalign/index.html?mhq=LCS%20dna&mhsrc=ibmsearch_a

const NullSeq = Symbol("[Null Seq]")
const map = o => Array.prototype.map.bind(o)

class cell{
    constructor(v,p){
        this.val = v
        this.point = p
        this.row = -1
        this.col = -1
    }
}
const NullCell = new cell(0,null)


// #101 Time complexity: O(arr1.length * arr2.length)
class LCS{
    constructor(seqA,seqB,compareFn,autoInit=true){
        this.seqA = seqA
        this.seqB = seqB
        this.comp = compareFn || ((a,b)=>a==b)
        this.Mat = []
        this.filled = false
        if(autoInit)this.fillMat()
    }
    fillCell(iA,iB,above,left,leftAbove){
        let cellScore,temp;
        if (this.comp(iA, iB)) {
            cellScore = leftAbove.val + 1
        }else{            
            cellScore = leftAbove.val
        }
        temp = cellScore
        cellScore = Math.max(cellScore,above.val,left.val)
        let point;
        if(cellScore == temp){
            point = leftAbove
        }else if(cellScore == above.val){
            point = above
        }else{
            point = left
        }
        return new cell(cellScore,point);
    }
    genFillMat(){
        let _this = this
        return (function*(){
            let lcsArr = [];
            for (let X in _this.seqA) {
                let rowArr = [],
                    itemA = _this.seqA[X];
                for (let Y in _this.seqB) {
                    yield _this.seqB.length;
                    let itemB = _this.seqB[Y],
                        left = Y == 0 ? NullCell : rowArr[Y - 1],
                        above = X == 0 ? NullCell : lcsArr[X - 1][Y],
                        leftAbove = Y != 0 && X != 0 ? lcsArr[X - 1][Y - 1] : NullCell;
                    let nxtCell = _this.fillCell(itemA,itemB,above,left,leftAbove)
                    nxtCell.row = X
                    nxtCell.col = Y
                    rowArr.push(nxtCell);
                    nxtCell = undefined;
                }
                lcsArr.push(rowArr);
                rowArr = undefined;
            }
            _this.Mat = lcsArr;
            _this.filled = true;
            return true;
        })()
    }
    fillMat(){
        let lcsArr = [];
        for (let X in this.seqA) {
            let rowArr = [],
                itemA = this.seqA[X];
            for (let Y in this.seqB) {
                let itemB = this.seqB[Y],
                    left = Y == 0 ? NullCell : rowArr[Y - 1],
                    above = X == 0 ? NullCell : lcsArr[X - 1][Y],
                    leftAbove = Y != 0 && X != 0 ? lcsArr[X - 1][Y - 1] : NullCell;
                let nxtCell = this.fillCell(itemA,itemB,above,left,leftAbove)
                nxtCell.row = X
                nxtCell.col = Y
                rowArr.push(nxtCell);
            }
            lcsArr.push(rowArr);
        }
        this.Mat = lcsArr;
        this.filled = true;
    }
    getFinCell(){
        if(this.filled){
            let rMax = this.Mat.length-1
            let cMax = this.Mat[0].length-1
            return this.Mat[rMax][cMax]
        }
    }
    getTraceback(Common=true){
        let cell = this.getFinCell()
        let bufA = [],bufB = []
        let last
        while(cell.point != null){
            let prev = cell.point
            if(cell.row - prev.row == 1 && cell.col - prev.col == 1 && cell.val - prev.val == 1){
                if(Common){
                    // called for LCS
                    bufA.unshift({
                        item: this.seqA[cell.row],
                        index: cell.row
                    })
                    bufB.unshift({
                        item: this.seqB[cell.col],
                        index: cell.col
                    })
                }
            }else{
                if(!Common){
                    let itemA,itemB
                    if(cell.col != prev.col){
                        itemB = this.seqB[cell.col]
                    }else{
                        itemB = NullSeq
                    }
                    bufB.unshift({
                        item: itemB,
                        index: cell.col
                    })
                    if(cell.row != prev.row){
                        itemA = this.seqA[cell.row]
                    }else{
                        itemA = NullSeq
                    }
                    bufA.unshift({
                        item: itemA,
                        index: cell.row
                    })
                }
            }
            last = cell
            cell = prev
        }
        if(!Common){
            // if early closure
            if(last.col != 0 ){
                let Bhat = this.seqB.slice(0,last.col)
                bufB = map(Bhat)((v,i)=>{
                    return {
                        item:v,
                        index:i
                    }
                }).concat(bufB)
                bufA =  map(Bhat)(()=>{
                    return {
                        item:NullSeq,
                        index:-1
                    }
                }).concat(bufA)
            }else if(last.row != 0){
                let Ahat = this.seqA.slice(0,last.row)
                bufA = map(Ahat)((v,i)=>{
                    return {
                        item:v,
                        index:i
                    }
                }).concat(bufA)
                bufB =  map(Ahat)(()=>{
                    return {
                        item:NullSeq,
                        index:-1
                    }
                }).concat(bufB)
            }
        }
        return {bufA,bufB}
    }
    logMat(){
        let content = ""
        for (const row of this.Mat) {
            content += row.map(v=>v.val).join(" , ")
            content += "\n"
        }
        console.log(content)
    }
}


module.exports = {
    LCS,
    NullSeq
}

// let l = new LCS("ABABAB","ABAAB")
// let l = new LCS("AB","ABCABB")
// let l = new LCS("AB","ABCD")
// let l = new LCS("GCGCAATG","GCCCTAGCG")

// l.logMat()
// console.log(l.getTraceback(false))
// console.log(l.getTraceback())
