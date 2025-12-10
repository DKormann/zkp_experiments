import { print, rmap } from "./html";


type Unity = {tag: "unity"}
type Fun = {tag: "function", X: T, Y: T}
type Sigma = {tag: "sigma", X: T, Y: (x:T) => T}
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

type Var = {T: T, X: "var"}


type Term =

  {T: Unity}
  | {T: Fun, v: Var, X: Term}
  | {T: Sigma, X: Term, b: Term}
  | {T: Choice, case: 0 | 1, X: T}
  | {T: Eq, X: T}
  | {T: Type, X: T}
  | Var

const Unity: T = {tag: "unity"}
const unit: Term = {T: Unity}

const Sigma = (X: T, Y: (x:T) => T): Sigma => ({tag: "sigma", X, Y})

const Pair = (X:T) :Sigma => Sigma(X, (x:T) => X)
const pair = (X:Term, Y:Term) :  Term => ({T: Pair(X.T), X, b: Y})

print(unit)
print(pair(unit, unit))
