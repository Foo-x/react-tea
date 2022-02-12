# Data Flow Diagram

```mermaid
graph TD
    p[Props]
    i((Init))
    m[Model, dispatch]
    msg[Msg]
    u((Update))
    v((View))
    s((Subscriptions))

    p -- only on first render --> i
    p --> v & s & u
    i --> m
    m --> v & s
    v & s --> msg
    msg --> u
    u --> msg & m
```
