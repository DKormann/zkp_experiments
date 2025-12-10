import { print, rmap } from "./html";


type Unity = {tag: "unity"}
type Fun = {tag: "function", X: T, Y: Instance & ({T: Fun} | {T: Type})}
type Sigma = {tag: "sigma", X: T, Y: Expr}
type Eq = {tag: "EQ", T:T}
type Choice = {tag: "enum", A: T, B :T}
type Type = {tag: "type"}


type T = | Unity
| Fun
| Sigma
| Choice
| Unity
| Eq
| Type


type App = {T: T, X: Expr, Y: Expr}
type Var = {tag: "var", T: T}

type Instance =
  {T: Unity, X: null}
  | {T: Fun, v: Var, X: Expr}
  | {T: Sigma, X: Expr, b: Expr}
  | {T: Choice, case: 0 | 1, X: T}
  | {T: Eq, X: T}
  | {T: Type, X: T}

type Expr =
  {tag: "instance"} & Instance
  | Var
  | {tag: "app", T: T, f: Expr, x: Expr}


const instance = (X: Instance): Expr => ({tag: "instance", ...X})

const Type = (T:T):Expr => instance({T:{tag: "type"}, X: T})

const Unity: T = {tag: "unity"}
const unit: Expr = instance({T: Unity, X: null})



const F = (T: T, fn: (x:Expr) => Expr): Expr => {
  let v:Var = {tag: "var", T}
  let ret = fn(v)
  return instance({T: {tag: "function", X: T, Y: {T: {tag:"type"}, X:ret.T}}, v, X: ret})
}

const cf = (T:T, e:Expr):Expr => F(T, x=>e)

const Sigma = (T:T, e:Expr):Sigma =>({tag: "sigma", X: T, Y: e})
const Pair = (X:T, Y:T) => Sigma(X, cf(X, Type(Y)))
const pair = (X:Expr, Y:Expr):Expr => instance({T: Pair(X.T, Y.T), X: X, b: Y})

const unify = (a:T, b:T): boolean => JSON.stringify(a) == JSON.stringify(b)


const reduce = (e:Expr, ctx:Map<Var, Expr>): Expr => {

  if (e.tag == "app"){
    let {T, f, x} = e

    if (f.tag == "var") return ctx.get(f)
    if (f.tag == "app") return reduce({tag: "app", T, f:reduce(f,ctx), x}, ctx)

    if (f.tag =="instance"){
      if (f.T.tag == "function"){
        let {v, X} = (f as {T:Fun, v:Var, X:Expr})
        ctx.set(v, x)
        return reduce(X, ctx)
      }
    }
  }
  print("reduce: not implemented", e)
  throw new Error("reduce: not implemented")
}



let x = {tag: "var", T: Unity}


print(F(Unity, x=>x))

// const judge = (e:Expr, ctx:Map<Var, T>): boolean =>{

//   if (ctx.has(e)) return unify(ctx.get(e), e.T)
//   if (e.X == "var") return false
//   if (e.T.tag == "unity") return true
//   if (e.T.tag == "function"){
//     let {v, X} = (e as {T:Fun, v:Var, X:Expr})
//     ctx.set(v, e.T.X)
//     return judge(X, ctx)
//   }
//   if (e.T.tag == "sigma"){
//     let {X, b} = (e as {T:Sigma, X:Expr, b:Expr})
    
//   }
// }
