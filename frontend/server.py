import http.server
import ssl

PORT = 4443
context = ssl.SSLContext(ssl.PROTOCOL_TLS)
context.load_cert_chain(certfile="./secure/cert.pem", keyfile="./secure/key.pem", password='')
server_address = ("0.0.0.0", PORT)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler, bind_and_activate=True)
httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
print(f"Listening on port {PORT}")
httpd.serve_forever()