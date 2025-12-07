import { plot, print } from "./html";
import "./wasm"

const range = (n:number) => Array.from({length: n}, (_,i)=>i)

type element = {
  field: number,
  value: number,
}

let primes:number[] = [2,3]
let is_prime = (n:number) => {
  if (n < 2) return false
  let sqrt = Math.sqrt(n)
  let c = 0;
  while(1){
    let p = c < primes.length ? primes[c] : next_prime();
    c++;
    if (n % p == 0) return false;
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

let P30 = (1<<30)-(1<<8)-1
let P16 = 65519
let P8 = (1<<8) - 4-1

let P5 = (1<<5) - 1

let field = P5

for (let i = 0; i < field; i++) {
  print([i, i**3 % field])
}

plot(range(field).map(i=>i**3 % field))