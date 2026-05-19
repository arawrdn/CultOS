;; Judul: CultOS Token
;; Standar: SIP-010
;; Status: Fixed Match Expression Types

(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

(define-fungible-token cult-os u21000000000000)

(define-constant contract-owner tx-sender)
(define-constant ERR-UNAUTHORIZED (err u100))

;; Metadata
(define-constant TOKEN-NAME "CultOS")
(define-constant TOKEN-SYMBOL "CultOS")
(define-constant TOKEN-URI (some u"https://raw.githubusercontent.com/arawrdn/CultOS/refs/heads/main/CultOS_Logo.png"))
(define-constant TOKEN-DECIMALS u6)

;; --- Public Functions ---

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
    (begin
        (asserts! (is-eq tx-sender sender) ERR-UNAUTHORIZED)
        (try! (ft-transfer? cult-os amount sender recipient))
        ;; Perbaikan: Kedua cabang match sekarang mengembalikan (ok true)
        (match memo to-print (begin (print to-print) (ok true)) (ok true))
    )
)

;; --- Read Only Functions ---

(define-read-only (get-name)
    (ok TOKEN-NAME)
)

(define-read-only (get-symbol)
    (ok TOKEN-SYMBOL)
)

(define-read-only (get-decimals)
    (ok TOKEN-DECIMALS)
)

(define-read-only (get-balance (who principal))
    (ok (ft-get-balance cult-os who))
)

(define-read-only (get-total-supply)
    (ok (ft-get-supply cult-os))
)

(define-read-only (get-token-uri)
    (ok TOKEN-URI)
)

;; --- Minting ---

(begin
    (try! (ft-mint? cult-os u21000000000000 contract-owner))
)
