(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_DUPLICATE (err u409))
(define-constant ERR_BALANCE (err u402))
(define-constant OWNER tx-sender)
(define-constant REGISTRATION_FEE u25000000)

(define-map registry
  { id: uint }
  {
    name: (string-ascii 64),
    owner: principal,
    height: uint,
    uri: (string-ascii 256)
  }
)

(define-data-var cursor uint u0)

(define-public (register (name (string-ascii 64)) (uri (string-ascii 256)))
  (let
    (
      (next-id (+ (var-get cursor) u1))
    )
    (try! (stx-transfer? REGISTRATION_FEE tx-sender (as-contract tx-sender)))
    (map-set registry
      { id: next-id }
      {
        name: name,
        owner: tx-sender,
        height: block-height,
        uri: uri
      }
    )
    (var-set cursor next-id)
    (ok next-id)
  )
)

(define-public (withdraw (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender OWNER) ERR_UNAUTHORIZED)
    (as-contract (stx-transfer? amount tx-sender recipient))
  )
)

(define-read-only (get-entry (id uint))
  (map-get? registry { id: id })
)

(define-read-only (get-cursor)
  (ok (var-get cursor))
)
