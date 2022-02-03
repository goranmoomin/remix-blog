---
layout: post
title: 'Implementation of Zeta Transform (Sum Over Subset) & Mobius Transform (Inclusion-Exclusion)'
summary: '일명 SOS DP'
categories: [Problem Solving]
tags: [PS, Algorithm, Implementation]
date: 2022-01-24
---

## Definition
어떤 함수 $f: [0, 2^n - 1] \rightarrow [0, 2^n - 1]$을 생각하자. 이 때
다음의 transform을 정의한다.

Zeta Transform $z$: $\, z(f(s)) = \sum_{s' \subseteq s} f(s')$

Mobius Transform $\mu$: $\, \mu(f(s)) = \sum_{s' \subseteq s}
(-1)^{\vert s \setminus s' \vert}f(s')$

naive하게 계산한다면 모든 $s \in [0, 2^n - 1]$에 대해 $z$, $\mu$를
계산하는데는 총 $O(4^n)$의 시간이 걸리는데(약간 머리를 쓴다면
$O(3^n)$에도 해결된다), dp를 이용하여 이를 $O(n 2^n)$에 구할 수 있다.

> _This is_ a **blockquote with two paragraphs**. Lorem ipsum dolor sit amet,
> consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
> Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.
>
> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
> id sem consectetuer libero luctus adipiscing.


## Zeta Transform
Zeta Transform을 구하는 dp는 여타 $O(nlogn)$ 알고리즘과 원리가
비슷하다. ($n$ 자리에 $2^n$이 들어갔다고 생각해보면?) 각각의 $s$, 즉
$mask$에 대해 $i$번째 이하의 bit가 변해서 만들어질 수 있는 $mask$의
$submask$들의 집합이 존재할 것인데, 그들에 대한 합이 구해져 있다고
생각해보자. 이제 $i$에서 $i+1$로의 전이식을 알아내야 하는데, 각각의
$mask$의 $i+1$번째 bit가 켜져 있지 않다면 그 위치의 bit는 변할 필요가
없다는 점을 고려하자. 따라서 다음의 분기식이 쉽게 알 수 있을
것이다. (더 자세한 내용은 참고문헌 참고...)

$$ z_{i+1}(f(s)) = \begin{cases} z_i(f(s)) & \text{if $mask \oplus
2^{i+1} = 0$} \\ z_i(f(s)) + z_i(f(s \oplus 2^{i+1})) & \text{if $mask
\oplus 2^{i+1} \neq 0$} \end{cases} $$

코드를 봤을 때 흥미로운 점은, 원래의 배열에서 순서만 지켜서
modify시키는 경우 위 값이 계산 가능하다는 것이다. 증명은 $i+1$번째
bit가 켜져 있는 수 $s$에 대해, 두 번째 분기가 실행되는 순간이 항상 $s
\oplus 2^{i+1}$에 대한 첫 번째 분기가 실행되는 순간보다 나중임을
보이면 되는데, 코드처럼 $mask$를 증가시키는 순서로 짜면 된다.


## Mobius Transform
Mobius Transform은 부분집합에 대한 포함과 배제의 원리를 수식으로 적은
것과 다름이 없다. (단 부호를 주의하자, 원래의 집합이 항상 $+$
기호이다) 놀랍게도, 이 transform은 Zeta Transform을 그대로 이용할 수
있다. 사전 작업으로 $f(s)$의 값을, $s$의 1인 bit 수가 홀수인 경우
$-f(s)$로 치환해주면 된다. 이 함수에 대해 Zeta transform을 적용하고,
사전 작업을 한 번 더 시행하면 된다. 이 과정의 정당성은 $s$의 1인 bit
수가 홀수인지 짝수인지로 구분해서 계산해보면 알 수 있다.

그러나 반복문 순서를 바꾸는 것만으로 사전 작업 처리를 하지 않아도 되는
방법이 존재한다. odd-negation을 한 번 사용하면 $mask$에 의존적이지
않고 $submask$ 그 자체의 bit 수에 의존적인 부호가 부여된다고 볼 수
있는데, 이 때문에 자기 자신에 $+$ 부호가 붙는 Mobius transform에
맞추기 위해 한 번 더 odd-negation을 사용해야 했던 것이다. 그런데 항상
자기 자신이 먼저 처리되고, 나머지 $submask$들이 나중에 처리되도록 하면
된다.

즉 코드를 보면 알 수 있듯이, $i$번째 loop가 종료될 때의 loop
invariant는 $i$번째 이하의 bit가 변해서 만들어질 수 있는 $submask$들에
대한 계산값이 $\mu(mask)$에 담겨 있는 것이다. 그러면 1이 켜져 있는
bit를 만난 경우 subproblem 연산에서 $+$ 대신 $-$를 사용하면 된다. 아마
코드를 보는 게 더 이해가 빠를 것이다.


## Application
부분집합에 대한 합이나 포함과 배제 자체는 직접적으로 응용할 수 있는
부분이다. 그 외에 하나가 더 있는데, 사실 포함과 배제의 원리를 다시 쓴
것에 불과하지만 다시 마주하면 모를 것 같아서 적어둔다.

어떤 함수 $f, g: [0, 2^n - 1] \rightarrow [0, 2^n - 1]$을
생각하자. $g$가 $g(s) = \sum_{s' \subseteq s} f(s')$를 만족할 때, 만약
내가 알고 있는 값이 $g$뿐이라면, $g$에 Mobius transform을 적용한 값이
그대로 $f$라는 사실이다. 또한 bit를 뒤집는 사전 작업을 적용하여, $g(s)
= \sum_{s \subseteq s'} f(s')$의 점화식을 가지고 있는 경우도 처리
가능하다.


## Code
```c++
void zeta_transform(const vector<ll>& arr, vector<ll>& zeta) {
    int n = 0;
    while (arr.size() > (1 << n)) n++;

    zeta = vector<ll>(arr);
    for (int i=0; i<n; ++i) {
        for (int mask=0; mask<(1<<n); ++mask) {
            if (mask & (1 << i)) {
                zeta[mask] += zeta[mask ^ (1 << i)];
            }
        }
    }
}

// mu[mask] = arr[mask] - ... + ...
void mobius_transform(const vector<ll>& arr, vector<ll>& mu) {
    int n = 0;
    while (arr.size() > (1 << n)) n++;

    mu = vector<ll>(arr);
    for (int i=0; i<n; ++i) {
        for (int mask=(1<<n)-1; mask>=0; --mask) {
            if (mask & (1 << i)) {
                mu[mask] -= mu[mask ^ (1 << i)];
            }
        }
    }
}
```

## Reference
- [SOS Dynamic Programming
  (Tutorial)](https://codeforces.com/blog/entry/45223)
- [Tutorial on Zeta Transform, Mobius Transform and Subset Sum
  Convolution](https://codeforces.com/blog/entry/72488)
- [Codeforces Educational Round 119,
  G](https://codeforces.com/blog/entry/98061)
