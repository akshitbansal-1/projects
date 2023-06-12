### About
This is a service which fetches some pre-generated random ids from kafka on start of the server
and caches those in memory.
On each request, it picks an id and gives it corresponding to an URL.

In this we majorly used kafka, rather than any other service for key generation. This is a very
scalable solution.
