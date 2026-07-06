import { getAesthetic } from '../data/aesthetics'
import { NUTRITION_RULES, calcMacros, mealPlanFor } from '../data/nutrition'
import { useStore } from '../store'

interface Props {
  onOpenPaywall: () => void
}

export function Fuel({ onOpenPaywall }: Props) {
  const { state } = useStore()
  const profile = state.profile!
  const aesthetic = getAesthetic(profile.aestheticId)
  const macros = calcMacros(profile, aesthetic.goal)
  const plan = mealPlanFor(aesthetic.goal)
  const premium = profile.premium
  const visibleMeals = premium ? plan.meals : plan.meals.slice(0, 2)

  const totKcal = plan.meals.reduce((s, m) => s + m.kcal, 0)
  const totProtein = plan.meals.reduce((s, m) => s + m.protein, 0)

  return (
    <div className="screen fade-in">
      <p className="kicker">Fuel</p>
      <h1 style={{ fontSize: 26, margin: '6px 0 2px' }}>Your Numbers</h1>
      <p className="muted small" style={{ marginBottom: 16 }}>
        Calculated for {profile.name} · {aesthetic.icon} {aesthetic.name} ·{' '}
        {macros.goalLabel}
      </p>

      <div className="hero" style={{ textAlign: 'center' }}>
        <p className="kicker">Daily Target</p>
        <h1 style={{ fontSize: 48, margin: '6px 0' }}>
          {macros.calories.toLocaleString()}
        </h1>
        <p className="muted small">calories / day</p>
      </div>

      <div className="grid-3" style={{ marginTop: 14 }}>
        <div className="stat">
          <div className="value accent">{macros.proteinG}g</div>
          <div className="label">Protein</div>
        </div>
        <div className="stat">
          <div className="value">{macros.carbsG}g</div>
          <div className="label">Carbs</div>
        </div>
        <div className="stat">
          <div className="value">{macros.fatG}g</div>
          <div className="label">Fat</div>
        </div>
      </div>

      <div className="section-head">
        <h2>Meal Plan</h2>
        <span className="small muted">
          ~{totKcal} kcal · {totProtein}g protein
        </span>
      </div>
      <p className="muted small" style={{ marginBottom: 12 }}>
        {plan.title}. Scale portions up or down to hit your{' '}
        {macros.calories.toLocaleString()}-calorie target.
      </p>

      {visibleMeals.map((meal) => (
        <div key={meal.name} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15 }}>{meal.name}</h3>
            <span className="chip">
              {meal.kcal} kcal · {meal.protein}g P
            </span>
          </div>
          <ul className="list-plain" style={{ marginTop: 8 }}>
            {meal.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}

      {!premium && (
        <div className="card" style={{ textAlign: 'center', borderColor: 'rgba(255,201,77,0.4)' }}>
          <p style={{ fontSize: 26 }}>🔒</p>
          <h3 style={{ margin: '6px 0' }}>
            {plan.meals.length - visibleMeals.length} more meals in the full plan
          </h3>
          <p className="muted small" style={{ marginBottom: 14 }}>
            Premium unlocks the complete day of eating for every goal — cut,
            recomp and bulk — plus all PRO programs.
          </p>
          <button className="btn btn-primary" onClick={onOpenPaywall}>
            Unlock Full Meal Plans
          </button>
        </div>
      )}

      <div className="section-head">
        <h2>Non-Negotiables</h2>
      </div>
      <div className="card tip-card">
        <ul className="list-plain">
          {NUTRITION_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
