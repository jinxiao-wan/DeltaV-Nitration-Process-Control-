# Browser teaching model

This model was created for the 2026 reconstruction. All process quantities use normalized units. Simulation time is in seconds. It does not model nitration kinetics or reproduce a commissioned DeltaV plant.

## Dynamics

While running or ramping:

- Feed A target = clamp(valve A + flow disturbance, 0, 100).
- Feed A approaches its target with time constant 2 seconds.
- Feed B approaches valve B with time constant 2.5 seconds.
- Temperature target = 20 + 0.6 × measured feed A + thermal disturbance.
- Temperature approaches its target with time constant 15 seconds.

Idle or tripped feed targets are zero; the temperature target returns to 20. Residual flow/temperature decay preserves model inertia. Time steps are bounded to 0.5 seconds. Valve outputs remain between 0 and 100.

| Controller | Kp | Ki |
|---|---:|---:|
| Temperature master | 2.3 | 0.12 |
| Inner flow | 2 | 0.7 |
| Ratio follower | 2 | 0.6 |
| Direct temperature comparison | 2.3 | 0.12 |

PI controllers use conditional-integration anti-windup. Tracking provides bumpless strategy transitions. The temperature bias is `(setpoint−20)/0.6`. The ratio target is ratio × measured feed A. User ranges are temperature setpoint 35–65 and ratio 0.5–1.2. These are synthetic teaching values, not an operating recipe.

## State machine

Start with healthy signal and available utility enters CHECKS, then RAMPING after 2 seconds. The command ramp increases 5 normalized units/second up to 100 before RUNNING. Missing or lost permissives produce a latched TRIPPED state. High temperature indication begins at 65; high-high at 80 trips. Reset requires healthy conditions and temperature below 70, returns to IDLE, and requires a separate start. These transitions and thresholds are illustrative rather than an original plant startup procedure.

## Reproducible comparison

Both strategies begin at temperature 50, feed A 50, feed B 40, with the same −15 feed disturbance, run for 120 seconds and use the same model and numerical step. Integral absolute temperature error and peak absolute error are computed directly from those runs. The ratio follower is retained in both strategies. `npm run demo:csv` exports both traces.

The original PID values and transfer-function discussion are preserved in documentation but are not substituted into this model. The deterministic comparison is a teaching result, not a thesis or plant performance claim.
