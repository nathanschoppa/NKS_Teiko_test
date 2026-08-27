
// ── Palette ────────────────────────────────────────────────────────────────────
export const GREY_BG      = '#F2F2F2'   //outer page background
export const WHITE        = '#FFFFFF'   //card / section bodies
export const GREY_LIGHT   = '#FAFAFA'   //Table alternating rows
export const ACCENT       = '#E8491E'   //red-orange highlight
export const ACCENT_LIGHT = '#FAD9D1'   //soft tint for hover / selected rows
export const BORDER       = '#DEDEDE'   //subtle dividers
export const TEXT_PRIMARY = '#1A1A1A'
export const TEXT_MUTED   = '#6B6B6B'
export const FONT         = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

// ── Reusable Syles ─────────────────────────────────────────────────────────────

export const sectionCard = {
    backgroundColor: WHITE,
    borderRadius:    '10px',
    padding:         '24px 28px',
    marginBottom:    '24px',
    boxShadow:       '0 1px 4px rgba(0,0,0,0.07)',
    border:          `1px solid ${BORDER}`,
    fontFamily:      FONT,
}

export const sectionLabel = {
    fontSize:      '14px',
    fontWeight:    '600',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color:         ACCENT,
    marginBottom:  '4px',
    marginTop:     '0',
    fontFamily:   FONT,
}

export const sectionTitle = {
    fontSize:     '32px',
    fontWeight:   '600',
    color:        TEXT_PRIMARY,
    margin:       '0 0 16px 0',
    fontFamily:   FONT,
}

export const subsectionTitle = {
    fontSize:   '24px',
    fontWeight: '600',
    color:      TEXT_PRIMARY,
    margin:     '0 0 16px 0',
    fontFamily: FONT
}

export const sectionText = {
    fontSize:     '14px',
    fontWeight:   '400',
    color:        TEXT_PRIMARY,
    margin:       '0 0 16px 0',
    fontFamily:   FONT,
}

export const subsectionText = {
    fontSize:     '14px',
    fontWeight:   '600',
    color:        TEXT_PRIMARY,
    fontFamily:   FONT,
}

export const ButtonStyle = {
    backgroundColor: ACCENT,
    color:           WHITE,
    border:          'none',
    borderRadius:    '6px',
    padding:         '0px 10px',   
    height:          '36px',        
    alignSelf:       'flex-start' as const,
    fontSize:        '13px',
    boxSizing:       'border-box' as const,
    width:           '90px',
    fontWeight:      '600',
    cursor:          'pointer',
    fontFamily:      FONT,
    lineHeight:      '36px',
}