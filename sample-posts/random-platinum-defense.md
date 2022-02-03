---
layout: post
title: '랜플디를 쉽게 해 보자'
summary: '랜덤 플레티넘 디펜스를 터미널에서 시작해보자'
categories: [Development, Problem Solving]
tags: [Dev, PS]
date: 2022-01-12
---

## Intro
[Solved.ac](https://solved.ac)에서 Platimum V ~ Platinum I 난이도로
매겨져 있는 문제를 랜덤으로 잡아서 푸는 공부를 누군가가 강력히
추천했고, 누군가가 같이 하자고 하길래... 랜플디를 시작해서 열심히
문제를 푸는 중이었다. 그런데 굉장히 짜증나는 일이 있었는데,

1) 솔브닥 검색 페이지에서 "tier:p5..p1 -solved_by:$me"를 입력한다.

2) option + enter를 누르면 아예 랜덤으로 하나가 선택되어서 벡준의 그
문제 페이지로 redirect된다.

3) 열심히 랜플디를 한다.

4) 뒤로가기를 눌러서 솔브닥으로 돌아온다.

5) 다시 검색창을 열면 입력했던 쿼리가 없어져있다.

쿼리의 길이가 짧다면 짧고 길다면 긴 길이라 계속 거슬려서, 터미널에서
딱 '뭔가 커맨드'를 치면 바로 백준 문제 페이지로 redirect되는 기능을
만들고 싶었다.


## So...?
이렇게 됐으니 솔브닥에서 어떻게 백준으로 redirect되는 기능을 구현한
건지를 알아보기 위해 소스를 뜯어봤는데... Next.js로 구현되어 있길래
포기했다. API endpoint가 있다면 알아내고 싶었는데 소스 읽기로는
불가능하다는 결론을 내려서, 프록시 서버를 깔아서 추적해보기로 했다. 그
결과,

![Get!](/images/solvedac-api-proxy.png)

API endpoint가 있다는 사실을 알아냈다. 즉 redirect를 해주는 주체는
javascript임을 알아냈으므로, 여기서부터는 직접 쉘 커맨드를 작성하는
수밖에 없었다. 그렇게 또 일련의 과정을 거쳐서, 사진과 같은 광경(?)을
볼 수 있었다!

![Yeaaaaah!](/images/rpd-result.webp)

## Code
zsh를 쓰고 있기 때문에, .zprofile에 다음 코드가 추가되어 있는 상태이다.
```shell
alias rpd='open "https://boj.kr/$(curl --silent "https://solved.ac/api/v3/search/random_problem?query=tier:p5..p1+-solved_by:sharaelong" | jq .problemId)"'
```

## Conclusion
덕분에 편하게 랜플디를 할 수 있게 되었고, 잡다한 개발 팁?을 새로 알게
된 것도 있는 듯. [Sungbin Jo
(@goranmoomin)](https://twitter.com/goranmoomin)에게 도움을 많이
받았다. Thank you!
