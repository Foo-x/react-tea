# Data Flow Diagram

```mermaid
graph TD
    p[Props]
    i((Init))
    m[Model]
    msg[Msg]
    h((useHooks))
    H[HooksResult]
    u((Update))
    v((View))
    s((Subscriptions))

    p -- only on first render --> i
    p --> v & s & u & h
    i --> m
    m --> v & s & h
    h --> H --> v & s
    v & s --> msg
    msg --> u
    u --> msg & m
```
