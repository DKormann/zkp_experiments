import { print, rmap } from "./html";


type Unity = {tag: "unity"}
type Fun = {tag: "function", X: T, Y: T}
type Sigma = {tag: "sum", X: T, Y: (x:T) => T}
type Eq = {tag: "EQ", T:T}
type Choice = {tag: "enum", A: T, B :T}

type T = | Unity
| Fun
| Sigma
| Choice
| Eq
| {tag: "instance" &
  ( {T: Unity}
  | {T: Fun, bod: (x:T) => T}
  | {T: Sigma, a: T, b: T}
  | {T: Choice, case: 0 | 1, value: T})
}






