{/* 
  AUTHOR: Nathaniel Schoppa 
  DATE: August 26 2026
  
  This is the main app. It contains some CSS for the page and header
  Sections are stored as pages, named Section#. They contain all
  CSS formatting and elements
  */}
import Section1 from './pages/Section1'
import Section2 from './pages/Section2'
import Section3 from './pages/Section3'
import  * as Style  from './styles/common'
import './App.css'

function App() {
  return (
    <div 
      style={{
        backgroundColor: Style.GREY_BG,
        minHeight:       '100vh',
        fontFamily:      Style.FONT,
        padding:         '0',
        margin:          '0',
      }
    }>
      {/* Header Bar */}
      <div
        style = {{
          backgroundColor: Style.WHITE,
          borderBottom:    `3px solid ${Style.ACCENT}`,
          padding:         '18px 48px',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'space-between',
          marginBottom:    '32px',
          boxShadow:       '0 1px 4px rgba(0,0,0,0.06)'
        }}
      >
        <div>
          <span 
            style={{
              fontSize: '22px',
              fontWeight: '700',
              color: Style.ACCENT,
              letterSpacing: '-0.02em',}}
          >teiko</span>
          <span 
            style={{
              fontSize: '14px',
              color: Style.TEXT_MUTED,
              marginLeft: '8px',}}
          > · melanoma cell count explorer</span>
          <span 
            style={{
              fontSize: '14px',
              color: Style.TEXT_MUTED,
              marginLeft: '8px',}}
          >· UNOFFICIAL - Nathan SCHOPPA TECHNICAL TEST</span>
        </div>
        <p
          style = {{
            fontSize:  '12px',
            color: Style.TEXT_MUTED,
            margin:    '0',
            fontWeight: '500',
          }}
        >Clinical Trial Dashboard</p>
      </div>
      {/* Main Content */}
      <div style = {{'padding': '0 48px 48px 48px', 'maxWidth': '1400px', 'margin': '0 auto'}}>
        <Section1 />
        <Section2 />
        <Section3/>
      </div>
    </div>
  )

}

export default App
