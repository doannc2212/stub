An application for create custom response.

## Installation
Firstly, clone this repository
```
git clone https://github.com/doannc2212/stub.git
```
1. Run with bun
```
cd stub
bun install
bun run dev
```
2. Docker (todo)
```
docker compose up -d
```
Then,
```
open http://localhost:3000
```

## How to use?
Note that you must attack cookie `userId=${value}` for api to know which user need mock response

1. Create a new mock response
Send a request to stub endpoint
```js
POST baseUrl/create
Cookie: userId=john
{
	// request method
	"method": "GET",
	// requset path, which place right after baseUrl/api/
	"path": "/sample",
	// response body
	"data": {
		"id": 1,
		"name": "John Doe"
	},
	// response status
	"status": 200
}
```

2. Clear mock response
```js
POST baseUrl/clear
Cookie: userId=john
```

3. Retrieve mock data
Send request to `baseUrl/api/` + `path` which you create before
*Request*:
```js
GET baseUrl/api/sample
Cookie: userId=john
```
Response:
```js
{
	"id": 1,
	"name": "John Doe"
}
```
