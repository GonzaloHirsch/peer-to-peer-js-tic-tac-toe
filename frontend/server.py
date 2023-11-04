import http.server
import ssl

context = ssl.SSLContext(ssl.PROTOCOL_TLS)
context.load_cert_chain(certfile="./secure/cert.pem", keyfile="./secure/key.pem", password='')
server_address = ("0.0.0.0", 4443)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler, bind_and_activate=True)
httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
httpd.serve_forever()