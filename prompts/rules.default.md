# Pseudonymization rules

Copy this file to `rules.md` in the same folder to make your own version; `rules.md` always wins. Sent to the local detection model only.

## Always pseudonymize
- Names of people (first names, last names, usernames, handles)
- Company, customer, partner and project names
- Email addresses, phone numbers, postal addresses
- IP addresses, hostnames, server names, internal domains and URLs
- API keys, passwords, tokens, connection strings
- Customer numbers, contract numbers, account IDs, IBANs

## In source code
- Pseudonymize hard-coded secrets, hostnames, and company-specific names in identifiers
  (e.g. `AcmeBillingService` -> treat `Acme` as COMPANY)
- Keep language keywords, standard library and public package names unchanged

## Never pseudonymize
- Generic technical terms (database, server, function)
- Public products and technologies (PostgreSQL, Kubernetes, React)
- Country and city names unless they identify a specific site

## Project-specific terms
<!-- Add your own, one per line, e.g.: -->
<!-- - "Project Falcon" is a PROJECT -->
