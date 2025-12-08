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
is_prime(P16)
let P5 = (1<<5) - 1
let P8 = (1<<8) - 4-1
const field = P8


print("field:", field)

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

function inverse(a) {
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



let sample : [number, number][] = points.slice(0,2).map((y,i)=>[points[i],y])

print(sample)

let g = newtonInterpolation(sample)

let ex = points.map(i=>g(i))

plot(ex)





