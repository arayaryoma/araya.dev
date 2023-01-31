use std::{
    io::{prelude::*, BufReader},
    net::{TcpListener, TcpStream},
};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:3001").unwrap();
    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream)
    }
}

fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&mut stream);
    let request_line = buf_reader.lines().next().unwrap().unwrap();
    
    if !request_line.starts_with("GET") {
        let response = "HTTP/1.1 405 MethodNotFound\r\n\r\n";
        stream.write_all(response.as_bytes()).unwrap();
        return;
    }else if request_line == "GET / HTTP/1.1" {
        let response = "HTTP/1.1 200 OK\r\n\r\n";
        stream.write_all(response.as_bytes()).unwrap();
    } else {
        let response = "HTTP/1.1 404 NotFound";
        stream.write_all(response.as_bytes()).unwrap();
    }
}
