'use client'

import { useState } from 'react'

export default function ResumePage() {
  const [generating, setGenerating] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  const handlePrint = () => {
    window.print()
  }

  const handleGeneratePDF = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/generate-resume-pdf')
      const data = await response.json()
      
      if (data.success) {
        setPdfUrl(data.downloadUrl)
        // Open the PDF in a new tab
        window.open(data.downloadUrl, '_blank')
      } else {
        alert('Error generating PDF: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error generating PDF. Check console for details.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          html, body {
            background: white;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          @page {
            margin: 0.75in;
            size: letter;
          }

          body {
            margin: 0 !important;
            padding: 0 !important;
          }

          * {
            box-shadow: none !important;
            border-radius: 0 !important;
          }

          /* Fix list bullets - use disc with proper positioning for PDF */
          ul {
            list-style-type: disc !important;
            list-style-position: outside !important;
            padding-left: 1.2em !important;
            margin: 0 !important;
            margin-left: 0.3em !important;
          }

          ul li {
            padding-left: 0.3em !important;
            margin-bottom: 0.15em !important;
          }

          ul li::marker {
            content: "• " !important;
            font-size: 1em !important;
          }

          .no-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .page-break-after {
            page-break-after: always;
            break-after: always;
          }

          .page-break-before {
            page-break-before: always;
            break-before: always;
          }
        }

        @media screen {
          body {
            background: #f5f5f5;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 py-8 print:p-0 print:bg-white">
        {/* Print Button - Only visible on screen */}
        <div className="max-w-[8.5in] mx-auto mb-6 px-4 print:hidden">
          <div className="flex gap-3">
            <button
              onClick={handleGeneratePDF}
              disabled={generating}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded shadow-lg transition-colors duration-200 flex items-center gap-2"
            >
              {generating ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate PDF (Server)
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded shadow-lg transition-colors duration-200 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print to PDF (Browser)
            </button>
          </div>
          {pdfUrl && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded p-3 text-sm text-green-900">
              <strong>✅ PDF Generated!</strong> Saved to <code className="bg-green-100 px-2 py-1 rounded">public/resume-generated.pdf</code>
              <br />
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-green-700 underline mt-1 inline-block">
                Open PDF →
              </a>
            </div>
          )}
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
            <strong>💡 For clean PDF:</strong> In print dialog, uncheck "Headers and footers"
          </div>
        </div>

        {/* Resume Content */}
        <div className="max-w-[8.5in] mx-auto bg-white shadow-xl print:shadow-none px-12 py-8 print:px-0 print:py-0"
             style={{fontSize: '10.5pt', lineHeight: '1.35', fontFamily: 'Calibri, "Helvetica Neue", Arial, sans-serif'}}>

          {/* Header */}
          <div className="border-b-3 pb-2 mb-3 no-break" style={{borderBottomWidth: '3px', borderBottomColor: '#1e40af'}}>
            <h1 className="text-3xl font-bold mb-1.5" style={{letterSpacing: '-0.01em', color: '#1e40af'}}>
              MICHAEL MARKMAN, CPA, MBA
            </h1>
            <div className="text-sm text-gray-700 flex flex-wrap gap-x-2">
              <span className="font-medium">Raleigh, NC</span>
              <span>•</span>
              <span>914-419-6783</span>
              <span>•</span>
              <span>michaelkmarkman@gmail.com</span>
            </div>
            <div className="text-sm text-gray-700">
              linkedin.com/in/michael-markman-5b348375
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mb-3 no-break">
            <h2 className="text-base font-bold uppercase mb-1.5 pb-1 border-b-2" style={{color: '#1e40af', borderBottomColor: '#1e40af'}}>
              EXECUTIVE SUMMARY
            </h2>
            <p className="text-sm text-gray-900 mb-2">
              Finance and operations transformation executive with 20+ years across private equity, CRO, and enterprise
              environments. Architect of automation and analytics programs that modernize global finance and operational
              processes, reduce costs, and improve decision velocity. Proven ability to build and lead global teams,
              deliver $10M+ annual savings, and align strategy, systems, and reporting for C-suite execution.
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-semibold">Core Expertise:</span> Finance Transformation • Global Shared Services • Operations Analytics •
              Process Mining • Automation COEs • Forecasting &amp; Reporting • M&amp;A Integration • SOX &amp; US GAAP
            </p>
          </div>

          {/* Professional Experience */}
          <div className="mb-3">
            <h2 className="text-base font-bold uppercase mb-2 pb-1 border-b-2" style={{color: '#1e40af', borderBottomColor: '#1e40af'}}>
              PROFESSIONAL EXPERIENCE
            </h2>

            {/* Markman Group */}
            <div className="mb-3 no-break">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="text-sm font-bold text-black uppercase">MARKMAN GROUP, Raleigh, NC</h3>
                <span className="text-sm text-gray-700 font-medium whitespace-nowrap">May 2024 – Present</span>
              </div>
              <p className="text-sm font-semibold text-black mb-0.5">Partner, Data &amp; Operations Transformation</p>
              <p className="text-sm text-gray-700 mb-1.5 italic">
                Founded a consulting and analytics firm delivering enterprise-grade data automation and reporting platforms for CFO organizations.
              </p>
              <ul className="text-sm text-gray-900 space-y-1">
                <li>Architected proposal automation platform for agritech company, integrating CRM data with product catalogs,
                labor cost tracking, and customer management to reduce cycle time from days to hours</li>
                <li>Built cloud-based operations dashboards using Alteryx, Power BI, and Python for real-time KPI monitoring,
                cash flow analysis, and variance reporting</li>
                <li>Led ESG and operational reporting modernization for middle-market PE portfolio company, reducing manual
                reporting cycles by 80%</li>
                <li>Delivered current state assessment for private credit firm, documenting organizational structure,
                reporting workflows, cross-functional dependencies, and data infrastructure to inform transformation roadmap</li>
                <li>Managed delivery teams spanning project management, data engineering, and visualization to deploy analytics
                environments for executive clients</li>
              </ul>
            </div>

            {/* IQVIA */}
            <div className="mb-3">
              <div className="flex justify-between items-baseline mb-0.5 no-break">
                <h3 className="text-sm font-bold text-black uppercase">IQVIA, Raleigh, NC</h3>
                <span className="text-sm text-gray-700 font-medium whitespace-nowrap">Apr 2017 – May 2024 (7 years)</span>
              </div>
              <p className="text-sm text-gray-700 mb-1 italic">
                Global CRO and data-driven healthcare leader (~$13B revenue). Progressed through three senior finance and operations leadership roles: Global Controller for clinical trials JV (2017-2018), Head of Global Financial Shared Services leading 270-person organization (2019-2022), and VP of Enterprise Data & Analytics driving operations transformation (2022-2024).
              </p>

              {/* VP Enterprise Data & Analytics */}
              <div className="mb-2.5 no-break">
                <div className="flex justify-between items-baseline mb-0.5">
                  <p className="text-sm font-semibold text-black">VP, Enterprise Data &amp; Analytics (Operations)</p>
                  <span className="text-sm text-gray-600 whitespace-nowrap">Sep 2022 – May 2024</span>
                </div>
                <p className="text-sm text-gray-700 mb-1.5 italic">
                  Led Enterprise Data &amp; Analytics organization within Operations, expanding automation Center of Excellence into cross-functional data and performance function. Reported to EVP Global Technology &amp; Operations.
                </p>
                <ul className="text-sm text-gray-900 space-y-1">
                  <li>Built enterprise operations data platform and process mining capabilities using Celonis, Alteryx, and Power BI to improve cycle times in billing, collections, and service delivery</li>
                  <li>Partnered with regional leaders to embed automation and analytics into operational planning and performance management</li>
                  <li>Delivered governance framework for enterprise data quality and reporting standards, reducing manual reconciliation time by 50% and enabling real-time KPI visibility</li>
                  <li>Scaled analytics infrastructure reducing ad-hoc reporting requests by 70% through self-service capabilities</li>
                </ul>
              </div>

              {/* VP Head of Shared Services */}
              <div className="mb-2.5 no-break">
                <div className="flex justify-between items-baseline mb-0.5">
                  <p className="text-sm font-semibold text-black">VP, Head of Global Financial Shared Services</p>
                  <span className="text-sm text-gray-600 whitespace-nowrap">Jan 2019 – Sep 2022</span>
                </div>
                <p className="text-sm text-gray-700 mb-1.5 italic">
                  Led 270-person global organization across AP, AR, payroll, T&amp;E, tax, and close operations in 100+ countries.
                </p>
                <ul className="text-sm text-gray-900 space-y-1">
                  <li>Achieved $10M (40%) annualized cost savings and 31% net headcount reduction (120 FTEs) while expanding service scope and improving quality metrics</li>
                  <li>Founded Centers of Excellence for Celonis (process mining), Tableau (analytics), Alteryx (ETL/automation), Python (data engineering), and Microsoft Power Platform</li>
                  <li>Established first-in-function process mining capability using Celonis to identify $2M+ in additional process optimization opportunities</li>
                  <li>Implemented RPA bots eliminating 10,000+ hours of manual data entry annually</li>
                  <li>Served as primary CAO backup for US GAAP/SOX compliance; supported M&A finance due diligence and integration workstreams</li>
                </ul>
              </div>

              {/* Global Controller */}
              <div className="mb-2 no-break">
                <div className="flex justify-between items-baseline mb-0.5">
                  <p className="text-sm font-semibold text-black">Global Controller – Q² Solutions (IQVIA/Quest JV)</p>
                  <span className="text-sm text-gray-600 whitespace-nowrap">Apr 2017 – Dec 2018</span>
                </div>
                <p className="text-sm text-gray-700 mb-1.5 italic">
                  Oversaw all accounting operations and reporting for joint venture between IQVIA and Quest Diagnostics providing laboratory services for clinical trials.
                </p>
                <ul className="text-sm text-gray-900 space-y-1">
                  <li>Managed global accounting operations ensuring compliance with both parent company requirements and regulatory standards</li>
                  <li>Implemented controls and processes supporting rapid growth while maintaining accuracy and timely financial close</li>
                </ul>
              </div>
            </div>

            {/* Siguler Guff */}
            <div className="mb-3 no-break">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="text-sm font-bold text-black uppercase">SIGULER GUFF &amp; COMPANY, New York, NY</h3>
                <span className="text-sm text-gray-700 font-medium whitespace-nowrap">May 2013 – Apr 2017</span>
              </div>
              <p className="text-sm font-semibold text-black mb-0.5">Vice President – Corporate Controller</p>
              <p className="text-sm text-gray-700 mb-1.5 italic">
                Directed all accounting and financial operations for $11B AUM private equity firm with eight international offices. Supervised 10-person global finance team.
              </p>
              <ul className="text-sm text-gray-900 space-y-1">
                <li>Transformed monthly close process reducing cycle time from 15 to 7 business days</li>
                <li>Led implementation of Concur expense platform cutting processing time by 50%</li>
                <li>Managed complex financial operations including consolidations, GAAP compliance, SOX audits, and broker-dealer regulatory reporting</li>
              </ul>
            </div>

            {/* KKR */}
            <div className="mb-3 no-break">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="text-sm font-bold text-black uppercase">KOHLBERG KRAVIS ROBERTS (KKR), New York, NY</h3>
                <span className="text-sm text-gray-700 font-medium whitespace-nowrap">Apr 2010 – May 2013</span>
              </div>
              <p className="text-sm font-semibold text-black mb-0.5">Manager – Management Company / Financial Planning &amp; Analysis</p>
              <p className="text-sm text-gray-700 mb-1.5 italic">
                Founding team member of the FP&A group that assisted in the development of a consolidated Firm operating plan that set high-level Firm-wide goals, provided analysis of performance and highlighted key takeaways for future planning.
              </p>
              <ul className="text-sm text-gray-900 space-y-1">
                <li>Co-designed and implemented SAP financial platform serving as new system of record for global operations</li>
                <li>Built competitive benchmarking framework tracking 30+ global business lines against internal and external metrics</li>
                <li>Overhauled quarterly close process to meet public company standards following IPO, improving efficiency by 30%</li>
              </ul>
            </div>

            {/* EY */}
            <div className="mb-3 no-break">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="text-sm font-bold text-black uppercase">ERNST &amp; YOUNG LLP, New York, NY</h3>
                <span className="text-sm text-gray-700 font-medium whitespace-nowrap">Aug 2005 – Apr 2010</span>
              </div>
              <p className="text-sm font-semibold text-black mb-0.5">Senior Accountant – Financial Services Office</p>
              <p className="text-sm text-gray-700 italic">
                Financial services specialist in investment banking and private equity advisory. Notable engagements: Apollo Global Management, Bank of America/Merrill Lynch Merger, Bear Stearns Liquidation, UBS Investment Bank, National Australian Bank.
              </p>
            </div>
          </div>

          {/* Education */}
          <div className="mb-3 no-break">
            <h2 className="text-base font-bold uppercase mb-2 pb-1 border-b-2" style={{color: '#1e40af', borderBottomColor: '#1e40af'}}>EDUCATION</h2>
            <div className="text-sm text-gray-900 space-y-1">
              <p><span className="font-semibold">Master of Business Administration (MBA)</span> | Columbia Business School | 2013-2015 | Dean&apos;s List</p>
              <p><span className="font-semibold">Bachelor of Science: Accounting (CPA track) &amp; Finance</span> | Syracuse University - Whitman School of Management | 2001-2005 | Dean&apos;s List, Beta Alpha Psi</p>
              <p><span className="font-semibold">Certified Public Accountant (CPA)</span> | New York State | Active</p>
            </div>
          </div>

          {/* Technology */}
          <div>
            <h2 className="text-base font-bold uppercase mb-1.5 pb-1 border-b-2" style={{color: '#1e40af', borderBottomColor: '#1e40af'}}>
              TECHNOLOGY
            </h2>
            <div className="text-sm text-gray-900" style={{listStyle: 'none', paddingLeft: 0}}>
              <div className="mb-2">
                <strong>Advisory Board Memberships:</strong> Alteryx Visionary Board, AppZen Customer Advisory Board
              </div>
              <div className="mb-1"><strong>Technology Expertise:</strong></div>
              <div className="mb-0.5"><strong>Analytics &amp; Automation:</strong> Alteryx, Tableau, Python, Celonis, Power BI, Microsoft Power Platform</div>
              <div className="mb-0.5"><strong>RPA &amp; AI:</strong> AssistEdge, Automation Anywhere, AppZen</div>
              <div><strong>ERP &amp; Financial Systems:</strong> SAP, PeopleSoft Financials, Microsoft Dynamics GP, NetSuite, QuickBooks</div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
