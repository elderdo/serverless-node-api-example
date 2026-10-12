# Using curl with this API

`curl` is a command-line tool that sends HTTP requests, the same kind a browser or mobile app sends. It lets you try the API without writing any client code.

## Installing curl

First check whether you already have it:

```bash
curl --version
```

On Windows PowerShell, use `curl.exe --version`. In Windows PowerShell 5.1 the plain word `curl` is an alias for a different command (`Invoke-WebRequest`), so always type `curl.exe` there.

| System            | How to get curl                                                                             |
| :---------------- | :------------------------------------------------------------------------------------------ |
| **Windows 10/11** | Already installed as `C:\Windows\System32\curl.exe`. If missing: `winget install cURL.cURL` |
| **macOS**         | Already installed. Newer version: `brew install curl`                                       |
| **Ubuntu/Debian** | `sudo apt update && sudo apt install curl`                                                  |
| **Fedora/RHEL**   | `sudo dnf install curl`                                                                     |

"Globally" means installed system-wide so any terminal can run `curl`. The package managers above (winget, brew, apt, dnf) all do that. You don't need a per-project install, because curl is not an npm package.

## The three flags used below

| Flag                 | Meaning                                                                                                                          |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `-X POST`            | Use the POST method (sending data). Without it, curl uses GET (reading data).                                                    |
| `-H "Header: value"` | Add an HTTP header. `Content-Type: application/json` tells the server the body is JSON, which `express.json()` needs to read it. |
| `-d '...'`           | The request body (the data you send).                                                                                            |

## Step by step

Start the server first in another terminal (`npm start`). The examples assume port 8000; use your `PORT` from `.env`.

### 1. Health check (GET)

```bash
# Ask the server if it is alive. GET is the default, so no flags are needed.
curl http://localhost:8000/health
# Response: {"status":"UP","timestamp":"..."}
```

### 2. Register an account (POST)

```bash
# Send a new username and password. The server stores only a hash of the password.
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123"}'
# Success (201): {"success":true,"data":{"username":"alice"}}
# Already exists (409): {"error":"Username already taken"}
# Password under 8 characters (400): {"error":"Password must be at least 8 characters"}
```

### 3. Log in (POST)

```bash
# Exchange your credentials for a token (a signed session pass, valid 15 minutes by default).
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123"}'
# Success: {"success":true,"data":{"token":"eyJhbGciOi..."}}
# Wrong credentials (401): {"error":"Invalid username or password"}
```

Copy the long `token` value.

### 4. Call a protected route (GET with a token)

```bash
# Send the token in the Authorization header. "Bearer" means "the holder of this token".
curl http://localhost:8000/me \
  -H "Authorization: Bearer PASTE_YOUR_TOKEN_HERE"
# Success: {"username":"alice"}
# No or bad token (401): {"error":"Missing bearer token"} or {"error":"Invalid or expired token"}
```

### 5. Check your CORS settings

This command sends an HTTP request to your local server:

```bash
curl -i -H "Origin: http://localhost:5173" http://localhost:8000/health
```

- `curl` makes an HTTP request.
- `-i` includes the response’s HTTP status line and headers in the output, followed by the response body.
- `-H "Origin: http://localhost:5173"` adds an `Origin` request header, as if the request came from a page served at that address. This is useful for checking how the server handles CORS.
- `http://localhost:8000/health` is the URL being requested. Since no method is specified, curl uses `GET`.

The `Origin` header lets you inspect the server’s CORS response headers, such as `Access-Control-Allow-Origin`. It does **not** make curl enforce browser CORS rules.

## Windows notes

- **Line continuation:** the examples use `\` at line ends (bash/macOS/Linux). In PowerShell use a backtick `` ` `` instead, or put the whole command on one line.
- **Quotes:** PowerShell and cmd mangle the double quotes inside JSON. The most reliable PowerShell form puts the JSON in a variable and pipes it in:

```powershell
$body = '{"username":"alice","password":"password123"}'
$body | curl.exe -X POST http://localhost:8000/register -H "Content-Type: application/json" -d "@-"
```

`-d "@-"` means "read the body from standard input". Alternatively, run the commands in Git Bash, which behaves like Linux.

## Handy extras

- `curl -i URL` also shows the response status line and headers.
- `curl -s URL` hides the progress meter.
- Not a fan of the command line? Postman, Insomnia, or the VS Code "REST Client" extension send the same requests with a UI.
