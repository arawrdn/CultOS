;; CultOS Registry Contract
;; Version: 2.0
;; This contract stores memetic cult records and handles registration fees.

(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_INVALID_PARAMS (err u400))
(define-constant OWNER tx-sender)
(define-constant REGISTRATION_FEE u25000000) ;; 25 STX

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

;; Public Functions

(define-public (register (name (string-ascii 64)) (uri (string-ascii 256)))
  (let
    (
      (next-id (+ (var-get cursor) u1))
      (contract-address (as-contract tx-sender))
    )
    ;; Transfer STX to this contract's principal
    (try! (stx-transfer? REGISTRATION_FEE tx-sender contract-address))
    
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

;; Read-only Functions

(define-read-only (get-entry (id uint))
  (map-get? registry { id: id })
)

(define-read-only (get-cursor)
  (ok (var-get cursor))
)

