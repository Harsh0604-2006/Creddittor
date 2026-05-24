import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from './components/pages/Landing'
import Audit from './components/pages/Audit'
import Result from './components/pages/Result'

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<Landing />} />
			<Route path="/audit" element={<Audit />} />
			<Route path="/result/:id" element={<Result />} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	)
}
