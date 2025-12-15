
import { bars, plot, print } from "./html";
const range = (n:number) => Array.from({length: n}, (_,i)=>i)

type element = {
  field: number,
  value: number,
}

let primes:number[] = [2,3]
let is_prime = (n:number, clbck?: (p:number) => void) => {
  if (n < 2) return false
  let sqrt = Math.sqrt(n)
  let c = 0;
  while(1){
    let p = c < primes.length ? primes[c] : next_prime();
    c++;
    if (n % p == 0) {
      if (clbck) clbck(p)
      return false};
    if (p >= sqrt) return true;
  }
}

let next_prime = ():number => {
  let k = primes[primes.length - 1] + 2
  while (1){
    if (is_prime(k)) break
    k += 2
  }

  primes.push(k)
  return k
}

const get_prime = (n:number)=>{
  while (n >= primes.length){
    next_prime()
  }
  return primes[n]
}

let P30 = (1<<30)-(1<<8)-1

let P16 = 65519

const field = P16

const mod = (x:number) => (x + field) % field

const mul = (a:number, b:number) => (a * b) % field
const add = (a:number, b:number) => (a + b) % field

const pow = (a:number, b:number) => {
  let result = 1
  for (let i = 0; i < b; i++) {
    result = mul(result, a)
  }
  return result
}



let omega = 58
let roots_n = 3854


let roots = [1]
for (let i = 0; i < roots_n; i++) {
  roots.push(mul(roots[i], omega))
}



function inverse(a:number) {
  a = Number((a) % (field));
  let [old_r, r] = [a, field];
  let [old_s, s] = [1, 0];
  while (r !== 0) {
    const q = Math.floor(old_r / r);
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  return (old_s % field + field) % field;
}




let get_root = (n:number)=> {
  if (n < 0) return roots[roots_n -Math.abs(n) % roots_n]
  return roots[(n + roots_n) % roots_n]}


const IFFT = (evals: number[]) =>{

  let ninv = inverse(roots_n)

  let c = range(roots_n)
  .map(i=> evals.map((t, j)=> mul(get_root(-i * j), t))
  .reduce((acc, curr) => add(acc, curr), 0))
  .map(c=> mul(c, ninv))
  return c
}




{


  // toy example

  // can i prove i know a number that devides 25?


  // devides(25, X) = true

  // mul (X, Y) = 25

  //X: number one
  //Y: number two
  //R: result

  // constraint:

  // if t is set : R = X * Y
  // C[i] = t[i] * (X[i] * Y[i] - R[i]) == 0
  // boundary: R[0] == 25

  // todo:
  // merkle tree of many checks for all polynomials
  // FRI proof that all polys are low degree




  [
    {X: 5, Y: 5, R: 25},
  ]

}







