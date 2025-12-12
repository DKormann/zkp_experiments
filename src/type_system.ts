import { print, rmap } from "./html";
import "./bridge_type/IC"


type TTag =
| "fun"
| "type"
| "sigma"
| "choice"
| "unity"



type RetType =  {tag:"const", t:Type} | {tag: "dep", t:A<"fun">};
type FunT = {tag: "fun", X: Type, Y:RetType}
type TypT = {tag: "type", X: TTag}
type SigmaT = {tag: "sigma", X: Type, Y: A<"fun">}
type ChoiceT = {tag: "choice", X: Type, Y: Type}
type UnityT = {tag: "unity"}


type Type = FunT | TypT | SigmaT | ChoiceT | UnityT


// ast

type VarA = {tag: "var", T: Type}
type AppA = {tag: "app", f: Ast, x: Ast}
type MatchA = {tag: "match", T:Type, e: Ast, cases: [FunA, FunA]}

type FunA = {tag: "fun", T: Type, F: RetType, v?: VarA, X: Ast}
type TypeA = {tag: "type", T: Type}
type ChoiceA = {tag: "choice", T: [Type, Type], choice: 0|1, x:Ast}
type UnityA = {tag: "unity"}
type SigmaA = {tag: "sigma", T:Type, F: FunA, X: Ast, Y: Ast}

type Ast = VarA | AppA | MatchA| FunA | TypeA | ChoiceA | UnityA | SigmaA

type A <T>  = Ast & {tag: T}


let reduce = (x:Ast, ctx: Map<VarA, Ast>): Ast => {
  switch(x.tag){
    case "var": return ctx.get(x) || x;
    case "app":{
      let {f, x:arg} = x;
      f = reduce(f, ctx);
      if (f.tag != "fun") throw new Error("Expected fun, got " + f.tag);
      ctx.set(f.v, arg)
      return reduce(f.X, ctx)
    }
    case "fun": return {...x, X: reduce(x.X, ctx)}
    case "choice": return {...x, x: reduce(x.x, ctx)}
    case "unity": return {tag: "unity"}
    case "match": 
  }
}

let call = (f:A<"fun">, x:Ast): Ast => {
  return reduce({tag: "app", f, x}, new Map());
}

let type = (x:Ast): Type =>{
  switch(x.tag){
    case "var": return x.T;
    case "app": {
      let f = type(x.f);
      let arg = type(x.x);
      if (f.tag == "fun"){
        if (f.Y.tag == "const") return f.Y.t;
        let t = call(f.Y.t, {tag:"type", T:arg});
        if (t.tag =="type") return t.T;
        else throw new Error("Expected type, got " + t.tag);
      }else{
        throw new Error("Expected fun, got " + f.tag);
      }
    }
    case "fun": return {tag: "fun", X: x.T, Y: x.F,}
    case "choice": return {tag: "choice", X: x.T[0], Y: x.T[1]}
    case "unity": return {tag: "unity"}
    case "match": 
  }
}



let F = (T:Type, fn: (x:Ast)=>Ast): Ast => {
  let vr: VarA = {tag: "var", T};
  let ret = fn(vr);
  return{
    tag: "fun",
    T, F: {tag: "const", t: ret.T}, X: vr,
  }
}



// type VarE = {tag: "var"}
// type AppE = {tag: "app", f: Raw, x: Raw}
// type MatchE = {tag: "match", e: Raw, cases: [R<"fun">, R<"fun">]}

// type FunE = {tag: "fun", v?: VarE, X: Raw}
// type TypeE = {tag: "type", T: Type}
// type ChoiceE = {tag: "choice", choice: 0|1, x:Raw}
// type UnityE = {tag: "unity"}
// type SigmaE = {tag: "sigma", X: Raw, Y: Raw}


// type Raw = VarE | AppE | MatchE | FunE | TypeE | ChoiceE | UnityE | SigmaE
// type R<T extends string> = Raw & {tag:T}

// type Expr = {T: Type, r: Raw}
// type E<T extends Type> = Expr & {T:T}

// let unity :Raw = {tag:"unity"}

// const Fun = (X:Type, Y: RetType, vr: VarE, bod: Expr) => {

// }

// let fc = (T:Type, e:Expr): Expr=> ({
//   r:  {tag: "fun", X: e.r,},
//   T: {tag: "fun", X: T, Y: {tag: "const", t:e.T}}
// })

// let F = (T:Type, fn: (x:Expr)=>Expr): Expr =>{
//   let vr: VarE = {tag: "var"}
//   let ret = fn({T: T, r: vr})
//   return {
//     r: {tag: "fun", v: vr, X: ret.r},
//     T: {tag: "fun", X: T, Y: {tag: "const", t:ret.T}}
//   }
// }

