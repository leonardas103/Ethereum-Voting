import http.server
import socketserver
import os


dir_path = os.path.dirname(os.path.realpath(__file__))
os.chdir(dir_path)  #changes parent dir to location of this file

PORT = 8080
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("serving at port", PORT)
    httpd.serve_forever()