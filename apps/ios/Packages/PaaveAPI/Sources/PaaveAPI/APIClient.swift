import Foundation

/// Structured error envelope — matches the backend contract exactly
/// (`{ "error": "CODE", "message": "..." }`, codes from the SBA error registry).
public struct APIErrorBody: Decodable, Sendable, Equatable {
    public let error: String
    public let message: String
}

public enum APIError: Error, Sendable {
    case transport(URLError)
    case server(status: Int, body: APIErrorBody?)
    case decoding(String)
}

/// Minimal typed client skeleton. Will be REPLACED by the generated client from
/// packages/contracts/openapi.yaml (swift-openapi-generator) once endpoints land —
/// the shape here exists so feature modules can be written against a stable seam.
public actor APIClient {
    private let baseURL: URL
    private let session: URLSession
    private let decoder = JSONDecoder()

    public init(baseURL: URL, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
    }

    public func get<T: Decodable & Sendable>(_ path: String, as type: T.Type) async throws -> T {
        let url = baseURL.appending(path: path)
        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await session.data(from: url)
        } catch let error as URLError {
            throw APIError.transport(error)
        }
        guard let http = response as? HTTPURLResponse else {
            throw APIError.decoding("Non-HTTP response")
        }
        guard (200..<300).contains(http.statusCode) else {
            let body = try? decoder.decode(APIErrorBody.self, from: data)
            throw APIError.server(status: http.statusCode, body: body)
        }
        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decoding(String(describing: error))
        }
    }
}
