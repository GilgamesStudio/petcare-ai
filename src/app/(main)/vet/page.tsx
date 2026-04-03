"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import {
  Hospital, Plus, Phone, MapPin, X, Loader2,
  Syringe, FileText, Calendar, ChevronDown, Star
} from "lucide-react"

interface Clinic { id: string; name: string; address: string | null; phone: string | null; notes: string | null; is_primary: boolean }
interface Pet { id: string; name: string; species: string }
interface MedicalRecord { id: string; pet_id: string; visit_date: string; reason: string; diagnosis: string | null; treatment: string | null; prescription: string | null; cost: number | null; next_visit: string | null; vet_clinics: { name: string } | null }
interface Vaccination { id: string; pet_id: string; name: string; date_given: string; next_due: string | null; vet_clinics: { name: string } | null }

type Tab = "clinics" | "records" | "vaccines"

export default function VetPage() {
  const [tab, setTab] = useState<Tab>("clinics")
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [vaccines, setVaccines] = useState<Vaccination[]>([])
  const [selectedPetId, setSelectedPetId] = useState("")
  const [loading, setLoading] = useState(true)

  // Modals
  const [showAddClinic, setShowAddClinic] = useState(false)
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [showAddVaccine, setShowAddVaccine] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Clinic form
  const [clinicName, setClinicName] = useState("")
  const [clinicAddr, setClinicAddr] = useState("")
  const [clinicPhone, setClinicPhone] = useState("")
  const [clinicPrimary, setClinicPrimary] = useState(false)

  // Record form
  const [recPetId, setRecPetId] = useState("")
  const [recClinicId, setRecClinicId] = useState("")
  const [recDate, setRecDate] = useState(new Date().toISOString().split("T")[0])
  const [recReason, setRecReason] = useState("")
  const [recDiagnosis, setRecDiagnosis] = useState("")
  const [recTreatment, setRecTreatment] = useState("")
  const [recPrescription, setRecPrescription] = useState("")
  const [recCost, setRecCost] = useState("")
  const [recNextVisit, setRecNextVisit] = useState("")

  // Vaccine form
  const [vacPetId, setVacPetId] = useState("")
  const [vacName, setVacName] = useState("")
  const [vacDate, setVacDate] = useState(new Date().toISOString().split("T")[0])
  const [vacNextDue, setVacNextDue] = useState("")
  const [vacClinicId, setVacClinicId] = useState("")

  useEffect(() => {
    Promise.all([
      fetch("/api/vet-clinics").then(r => r.json()),
      fetch("/api/pets").then(r => r.json()),
    ]).then(([c, p]) => {
      if (Array.isArray(c)) setClinics(c)
      if (Array.isArray(p)) {
        setPets(p)
        if (p.length > 0) {
          setSelectedPetId(p[0].id)
          setRecPetId(p[0].id)
          setVacPetId(p[0].id)
        }
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!selectedPetId) return
    Promise.all([
      fetch(`/api/medical-records?petId=${selectedPetId}`).then(r => r.json()),
      fetch(`/api/vaccinations?petId=${selectedPetId}`).then(r => r.json()),
    ]).then(([r, v]) => {
      if (Array.isArray(r)) setRecords(r)
      if (Array.isArray(v)) setVaccines(v)
    })
  }, [selectedPetId])

  async function addClinic() {
    if (!clinicName.trim()) return
    setSubmitting(true)
    const res = await fetch("/api/vet-clinics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: clinicName, address: clinicAddr, phone: clinicPhone, is_primary: clinicPrimary }),
    })
    const data = await res.json()
    if (data.id) {
      if (clinicPrimary) setClinics(prev => prev.map(c => ({ ...c, is_primary: false })))
      setClinics(prev => [data, ...prev])
    }
    setShowAddClinic(false)
    setClinicName(""); setClinicAddr(""); setClinicPhone(""); setClinicPrimary(false)
    setSubmitting(false)
  }

  async function addRecord() {
    if (!recPetId || !recReason.trim()) return
    setSubmitting(true)
    const res = await fetch("/api/medical-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pet_id: recPetId, clinic_id: recClinicId || null, visit_date: recDate, reason: recReason,
        diagnosis: recDiagnosis, treatment: recTreatment, prescription: recPrescription,
        cost: recCost ? parseInt(recCost) : null, next_visit: recNextVisit || null,
      }),
    })
    const data = await res.json()
    if (data.id) setRecords(prev => [data, ...prev])
    setShowAddRecord(false)
    setRecReason(""); setRecDiagnosis(""); setRecTreatment(""); setRecPrescription(""); setRecCost(""); setRecNextVisit("")
    setSubmitting(false)
  }

  async function addVaccine() {
    if (!vacPetId || !vacName.trim()) return
    setSubmitting(true)
    const res = await fetch("/api/vaccinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pet_id: vacPetId, name: vacName, date_given: vacDate,
        next_due: vacNextDue || null, clinic_id: vacClinicId || null,
      }),
    })
    const data = await res.json()
    if (data.id) setVaccines(prev => [data, ...prev])
    setShowAddVaccine(false)
    setVacName(""); setVacNextDue("")
    setSubmitting(false)
  }

  const upcomingVaccines = vaccines.filter(v => v.next_due && new Date(v.next_due) > new Date())
  const upcomingVisits = records.filter(r => r.next_visit && new Date(r.next_visit) > new Date())

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">불러오는 중...</div>

  return (
    <>
      <Header title="동물병원" showBack />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Pet Selector */}
        {pets.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {pets.map(pet => (
              <button key={pet.id} onClick={() => setSelectedPetId(pet.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                  selectedPetId === pet.id ? "bg-emerald-100 text-emerald-700 border border-emerald-300" : "bg-gray-100 text-gray-500"
                }`}>
                <span>{pet.species === "DOG" ? "🐶" : "🐱"}</span>{pet.name}
              </button>
            ))}
          </div>
        )}

        {/* Upcoming Alerts */}
        {(upcomingVaccines.length > 0 || upcomingVisits.length > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold text-amber-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> 예정된 일정
            </p>
            {upcomingVaccines.map(v => (
              <p key={v.id} className="text-xs text-amber-700">
                💉 {v.name} 접종 예정: {new Date(v.next_due!).toLocaleDateString("ko")}
              </p>
            ))}
            {upcomingVisits.map(r => (
              <p key={r.id} className="text-xs text-amber-700">
                🏥 재방문 예정: {new Date(r.next_visit!).toLocaleDateString("ko")} ({r.reason})
              </p>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          {([["clinics", "병원", Hospital], ["records", "진료기록", FileText], ["vaccines", "예방접종", Syringe]] as const).map(([key, label, Icon]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                tab === key ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500"
              }`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        {/* Clinics Tab */}
        {tab === "clinics" && (
          <div className="space-y-3">
            {clinics.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">등록된 병원이 없어요</div>
            ) : clinics.map(c => (
              <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  {c.is_primary && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                  <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                </div>
                {c.address && <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{c.address}</p>}
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3" />{c.phone}
                  </a>
                )}
              </div>
            ))}
            <button onClick={() => setShowAddClinic(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-emerald-300 hover:text-emerald-500">
              <Plus className="w-4 h-4" />병원 등록
            </button>
          </div>
        )}

        {/* Records Tab */}
        {tab === "records" && (
          <div className="space-y-3">
            {records.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">진료 기록이 없어요</div>
            ) : records.map(r => (
              <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">{r.reason}</span>
                  <span className="text-[10px] text-gray-400">{new Date(r.visit_date).toLocaleDateString("ko")}</span>
                </div>
                {r.diagnosis && <p className="text-xs text-gray-600 mb-1">진단: {r.diagnosis}</p>}
                {r.treatment && <p className="text-xs text-gray-600 mb-1">치료: {r.treatment}</p>}
                {r.prescription && <p className="text-xs text-blue-600 mb-1">💊 {r.prescription}</p>}
                <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                  {r.vet_clinics && <span>🏥 {r.vet_clinics.name}</span>}
                  {r.cost && <span>💰 {r.cost.toLocaleString()}원</span>}
                  {r.next_visit && <span>📅 재방문: {new Date(r.next_visit).toLocaleDateString("ko")}</span>}
                </div>
              </div>
            ))}
            <button onClick={() => setShowAddRecord(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-emerald-300 hover:text-emerald-500">
              <Plus className="w-4 h-4" />진료 기록 추가
            </button>
          </div>
        )}

        {/* Vaccines Tab */}
        {tab === "vaccines" && (
          <div className="space-y-3">
            {vaccines.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">접종 기록이 없어요</div>
            ) : vaccines.map(v => (
              <div key={v.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">💉 {v.name}</span>
                  <span className="text-[10px] text-gray-400">{new Date(v.date_given).toLocaleDateString("ko")}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                  {v.vet_clinics && <span>🏥 {v.vet_clinics.name}</span>}
                  {v.next_due && (
                    <span className={new Date(v.next_due) < new Date() ? "text-red-500 font-medium" : ""}>
                      다음 접종: {new Date(v.next_due).toLocaleDateString("ko")}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <button onClick={() => setShowAddVaccine(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-emerald-300 hover:text-emerald-500">
              <Plus className="w-4 h-4" />접종 기록 추가
            </button>
          </div>
        )}
      </main>

      {/* Add Clinic Modal */}
      {showAddClinic && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">병원 등록</h3>
              <button onClick={() => setShowAddClinic(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <input value={clinicName} onChange={e => setClinicName(e.target.value)} placeholder="병원 이름 *" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            <input value={clinicAddr} onChange={e => setClinicAddr(e.target.value)} placeholder="주소" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            <input value={clinicPhone} onChange={e => setClinicPhone(e.target.value)} placeholder="전화번호" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={clinicPrimary} onChange={e => setClinicPrimary(e.target.checked)} className="rounded" />
              기본 병원으로 설정
            </label>
            <button onClick={addClinic} disabled={!clinicName.trim() || submitting}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "등록하기"}
            </button>
          </div>
        </div>
      )}

      {/* Add Record Modal */}
      {showAddRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-5 space-y-3 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">진료 기록 추가</h3>
              <button onClick={() => setShowAddRecord(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <select value={recPetId} onChange={e => setRecPetId(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white">
              {pets.map(p => <option key={p.id} value={p.id}>{p.species === "DOG" ? "🐶" : "🐱"} {p.name}</option>)}
            </select>
            <select value={recClinicId} onChange={e => setRecClinicId(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white">
              <option value="">병원 선택 (선택사항)</option>
              {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="date" value={recDate} onChange={e => setRecDate(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
            <input value={recReason} onChange={e => setRecReason(e.target.value)} placeholder="방문 사유 *" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            <input value={recDiagnosis} onChange={e => setRecDiagnosis(e.target.value)} placeholder="진단명" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            <input value={recTreatment} onChange={e => setRecTreatment(e.target.value)} placeholder="치료 내용" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            <input value={recPrescription} onChange={e => setRecPrescription(e.target.value)} placeholder="처방약" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            <input type="number" value={recCost} onChange={e => setRecCost(e.target.value)} placeholder="진료비 (원)" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            <div>
              <label className="text-xs text-gray-500">다음 방문 예정일</label>
              <input type="date" value={recNextVisit} onChange={e => setRecNextVisit(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
            </div>
            <button onClick={addRecord} disabled={!recReason.trim() || submitting}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "저장하기"}
            </button>
          </div>
        </div>
      )}

      {/* Add Vaccine Modal */}
      {showAddVaccine && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">접종 기록 추가</h3>
              <button onClick={() => setShowAddVaccine(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <select value={vacPetId} onChange={e => setVacPetId(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white">
              {pets.map(p => <option key={p.id} value={p.id}>{p.species === "DOG" ? "🐶" : "🐱"} {p.name}</option>)}
            </select>
            <input value={vacName} onChange={e => setVacName(e.target.value)} placeholder="백신 이름 * (예: 종합백신 5차)" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            <div>
              <label className="text-xs text-gray-500">접종일</label>
              <input type="date" value={vacDate} onChange={e => setVacDate(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">다음 접종 예정일</label>
              <input type="date" value={vacNextDue} onChange={e => setVacNextDue(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
            </div>
            <select value={vacClinicId} onChange={e => setVacClinicId(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white">
              <option value="">병원 선택 (선택사항)</option>
              {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={addVaccine} disabled={!vacName.trim() || submitting}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "저장하기"}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
