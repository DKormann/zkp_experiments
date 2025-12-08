
import { plot, print } from "./html";
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

const get_prime = (n:number)=>{
  while (n >= primes.length){
    next_prime()
  }
  return primes[n]
}

let P30 = (1<<30)-(1<<8)-1

let P16 = 65519

const field = P16
let omega = 2209;
let roots_n = 3854;


const r = 6;

let points = [r]

for (let i = 0; i < field; i++) {
  points.push(r * points[i] % field)
  if (points[i+1] == 1) break
}


type Polynomial = number[]


let app = (f:Polynomial) =>
  points.map(x=> f.reduce((acc, coeff, i) => acc + coeff * x**i , 0) % field)


function mod(x: number) { return ((x % field) + field) % field; }



function newtonInterpolation(points: [number, number][]) {

  const n = points.length;
  const f = points.map(([x, y]) => y);
  const xvals = points.map(([x]) => (x));

  for (let j = 1; j < n; j++) {
    for (let i = n - 1; i >= j; i--) {
      f[i] = mod((f[i] - f[i - 1]) * inverse(mod(xvals[i] - xvals[i - j] + field)));
    }
  }

  let term = 1;
  for (let i = 0; i < n; i++) term = term * mod(-xvals[i]);

  function evalNewton(x:number) {
    x = (x) % (field);
    let result = f[n - 1];
    for (let i = n - 2; i >= 0; i--) result = mod(result * (x - xvals[i]) + f[i]);
    return result;
  }
  return evalNewton;
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

{
  let T = [0,1,2,3]
  let y = app(T)
  let sample = y.slice(0,4)
  let g = newtonInterpolation(sample.map((y,i)=>[points[i],y]))

  if (!sample.every((y,i)=>g(points[i]) == y)) {
    throw new Error("failed")
  }
}


const mul = (a:number, b:number) => (a * b) % field
const add = (a:number, b:number) => (a + b) % field

const pow = (a:number, b:number) => {
  let result = 1
  for (let i = 0; i < b; i++) {
    result = mul(result, a)
  }
  return result
}

let roots = [1]
for (let i = 0; i < roots_n; i++) {
  roots.push(mul(roots[i], omega))
}


let get_root = (n:number)=> roots[(n + roots_n) % roots_n]




const FFT = (trace: number[]) =>{
  // trace is values at roots of unity
  let ninv = inverse(roots_n)

  let c = trace.map((t,i)=> range(trace.length).map(j=>i*j)
    .map(jk => mul(get_root(-jk), t))
    .reduce((acc, curr) => add(acc, curr), 0)
  )
  .map(c=> mul(c, ninv))
  return c

}
{
  let samples = [0,1]
  let coeff = FFT(samples)

  let x = roots.slice(0, samples.length)
  let y = x.map(x=> coeff.reduce((acc, curr, i)=> add(acc, mul(curr, pow(x, i))), 0))
  print(y)
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
    {X: 3, Y: 2, R: 6},
    {X: 1, Y: 9, R: 9},
  ]

}







