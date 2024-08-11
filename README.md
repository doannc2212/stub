# Stub API
An application for create placeholder implementation of API responses which used as temporary substitute for the actual API.
Build with Hono and redis. Checkout elysia for elysia stuff

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
2. Run with Docker
```
docker compose up -d
```
Then,
```
Stub is up on http://localhost:8000
```

## How to use?
You need to attach cookie `userId=${value}` when request for api to know which user need data

1. Create a new mock response <br>
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

3. Retrieve mock data <br/>
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

## FAQ

# Stub api is not work after apply to my web application?

The stub API relies on cookies. To resolve this, follow these steps:

1. Open Chrome DevTools.
2. Navigate to the "Application" tab.
3. Locate the cookies associated with your stub API endpoint.
4. Set the "Same-Site" attribute of that cookies to "None".
