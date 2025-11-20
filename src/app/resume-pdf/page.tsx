'use client'

export default function ResumePDFPage() {
  const handlePrint = () => {
    window.print()
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
            margin: 0.4in;
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

          /* Typography optimizations for print */
          body {
            font-size: 11pt !important;
            line-height: 1.35 !important;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
          }

          /* Fix list bullets - use text instead of disc to avoid rendering issues */
          ul {
            list-style: none !important;
            padding-left: 1.5em !important;
          }

          ul li::before {
            content: "• ";
            font-weight: bold;
            display: inline-block;
            width: 1em;
            margin-left: -1.5em;
          }

          /* Prevent page breaks inside sections */
          .no-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          /* Keep headers with content */
          h2 {
            page-break-after: avoid;
            break-after: avoid;
          }

          /* Keep company header with first role */
          .company-header {
            page-break-after: avoid;
            break-after: avoid;
          }

          /* Keep role title with description */
          .role-section {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          /* Ensure at least 2 lines together */
          ul li {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          /* Print colors - convert to grayscale for better ATS compatibility */
          .print-black {
            color: #000000 !important;
          }

          .print-gray {
            color: #1a1a1a !important;
          }

          /* Override blue colors in print */
          h1 {
            color: #000000 !important;
          }

          /* Override border colors in print */
          .border-b-2 {
            border-bottom-color: #000000 !important;
          }

          /* Links should be visible in print */
          a {
            color: #000000 !important;
            text-decoration: none !important;
          }

          /* Hide print button */
          .print-button-container {
            display: none !important;
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
        <div className="print-button-container max-w-[8.5in] mx-auto mb-6 px-4 print:hidden">
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded shadow-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Export to PDF
          </button>
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
            <div className="font-semibold mb-2">💡 PDF Export Tips:</div>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>In print dialog, uncheck "Headers and footers"</li>
              <li>Select "Save as PDF" as destination</li>
              <li>Ensure "Background graphics" is enabled</li>
              <li>This version is optimized for ATS systems</li>
            </ul>
          </div>
        </div>

        {/* Resume Content */}
        <div 
          className="max-w-[8.5in] mx-auto bg-white shadow-xl print:shadow-none px-12 py-8 print:px-0 print:py-0"
          style={{
            fontSize: '11pt', 
            lineHeight: '1.35', 
            fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif'
          }}
        >
          {/* Header */}
          <div className="border-b-2 pb-2 mb-3 no-break print-black" style={{borderBottomColor: '#1e40af', borderBottomWidth: '2px'}}>
            <h1 
              className="text-3xl font-bold mb-2" 
              style={{
                letterSpacing: '-0.01em',
                color: '#1e40af'
              }}
            >
              MICHAEL MARKMAN, CPA, MBA
            </h1>
            <div className="text-sm print-gray flex flex-wrap gap-x-2 mb-1">
              <span className="font-medium">Raleigh, NC</span>
              <span>•</span>
              <a href="tel:9144196783" className="hover:underline print-black">914-419-6783</a>
              <span>•</span>
              <a href="mailto:michaelkmarkman@gmail.com" className="hover:underline print-black">michaelkmarkman@gmail.com</a>
            </div>
            <div className="text-sm print-gray">
              <a 
                href="https://linkedin.com/in/michael-markman-5b348375" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline print-black"
              >
                linkedin.com/in/michael-markman-5b348375
              </a>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mb-3 no-break">
            <h2 className="text-base font-bold uppercase print-black mb-1.5 pb-0.5 border-b-2 border-black">
              EXECUTIVE SUMMARY
            </h2>
            <p className="text-sm print-gray mb-1.5 leading-relaxed">
              Finance and operations transformation executive with 20+ years across private equity, CRO, and enterprise
              environments. Architect of automation and analytics programs that modernize global finance and operational
              processes, reduce costs, and improve decision velocity. Proven ability to build and lead global teams,
              deliver $10M+ annual savings, and align strategy, systems, and reporting for C-suite execution.
            </p>
            <p className="text-sm print-gray leading-relaxed">
              <span className="font-semibold">Core Expertise:</span> Finance Transformation • Global Shared Services • Operations Analytics •
              Process Mining • Automation COEs • Forecasting & Reporting • M&A Integration • SOX & US GAAP
            </p>
          </div>

          {/* Professional Experience */}
          <div className="mb-3">
            <h2 className="text-base font-bold uppercase print-black mb-2 pb-0.5 border-b-2 border-black">
              PROFESSIONAL EXPERIENCE
            </h2>

            {/* Markman Group */}
            <div className="mb-3 no-break">
              <div className="flex justify-between items-baseline mb-0.5 company-header">
                <h3 className="text-sm font-bold print-black uppercase">MARKMAN GROUP, Raleigh, NC</h3>
                <span className="text-sm print-gray font-medium whitespace-nowrap">May 2024 – Present</span>
              </div>
              <p className="text-sm font-semibold print-black mb-0.5">Partner, Data & Operations Transformation</p>
              <p className="text-sm print-gray mb-1.5 italic leading-relaxed">
                Founded a consulting and analytics firm delivering enterprise-grade data automation and reporting platforms for CFO organizations.
              </p>
              <ul className="text-sm print-gray space-y-0.5">
                <li className="leading-relaxed">Architected proposal automation platform for agritech company, integrating CRM data with product catalogs, labor cost tracking, and customer management to reduce cycle time from days to hours</li>
                <li className="leading-relaxed">Built cloud-based operations dashboards using Alteryx, Power BI, and Python for real-time KPI monitoring, cash flow analysis, and variance reporting</li>
                <li className="leading-relaxed">Led ESG and operational reporting modernization for middle-market PE portfolio company, reducing manual reporting cycles by 80%</li>
                <li className="leading-relaxed">Delivered current state assessment for private credit firm, documenting organizational structure, reporting workflows, cross-functional dependencies, and data infrastructure to inform transformation roadmap</li>
                <li className="leading-relaxed">Managed delivery teams spanning project management, data engineering, and visualization to deploy analytics environments for executive clients</li>
              </ul>
            </div>

            {/* IQVIA */}
            <div className="mb-3">
              <div className="flex justify-between items-baseline mb-0.5 no-break company-header">
                <h3 className="text-sm font-bold print-black uppercase">IQVIA, Raleigh, NC</h3>
                <span className="text-sm print-gray font-medium whitespace-nowrap">Apr 2017 – May 2024 (7 years)</span>
              </div>
              <p className="text-sm print-gray mb-2 italic leading-relaxed">
                Global CRO and data-driven healthcare leader (~$13B revenue)
              </p>

              {/* VP Enterprise Data & Analytics */}
              <div className="mb-2.5 no-break role-section">
                <div className="flex justify-between items-baseline mb-0.5">
                  <p className="text-sm font-semibold print-black">VP, Enterprise Data & Analytics (Operations)</p>
                  <span className="text-sm print-gray whitespace-nowrap">Sep 2022 – May 2024</span>
                </div>
                <p className="text-sm print-gray mb-1.5 italic leading-relaxed">
                  Led Enterprise Data & Analytics organization within Operations, expanding automation Center of Excellence into cross-functional data and performance function. Reported to EVP Global Technology & Operations.
                </p>
                <ul className="text-sm print-gray space-y-0.5">
                  <li className="leading-relaxed">Built enterprise operations data platform and process mining capabilities using Celonis, Alteryx, and Power BI to improve cycle times in billing, collections, and service delivery</li>
                  <li className="leading-relaxed">Partnered with regional leaders to embed automation and analytics into operational planning and performance management</li>
                  <li className="leading-relaxed">Delivered governance framework for enterprise data quality and reporting standards, reducing manual reconciliation time by 50% and enabling real-time KPI visibility</li>
                  <li className="leading-relaxed">Scaled analytics infrastructure reducing ad-hoc reporting requests by 70% through self-service capabilities</li>
                </ul>
              </div>

              {/* VP Head of Shared Services */}
              <div className="mb-2.5 no-break role-section">
                <div className="flex justify-between items-baseline mb-0.5">
                  <p className="text-sm font-semibold print-black">VP, Head of Global Financial Shared Services</p>
                  <span className="text-sm print-gray whitespace-nowrap">Jan 2019 – Sep 2022</span>
                </div>
                <p className="text-sm print-gray mb-1.5 italic leading-relaxed">
                  Led 270-person global organization across AP, AR, payroll, T&E, tax, and close operations in 100+ countries.
                </p>
                <ul className="text-sm print-gray space-y-0.5">
                  <li className="leading-relaxed">Achieved $10M (40%) annualized cost savings and 31% net headcount reduction (120 FTEs) while expanding service scope and improving quality metrics</li>
                  <li className="leading-relaxed">Founded Centers of Excellence for Celonis (process mining), Tableau (analytics), Alteryx (ETL/automation), Python (data engineering), and Microsoft Power Platform</li>
                  <li className="leading-relaxed">Established first-in-function process mining capability using Celonis to identify $2M+ in additional process optimization opportunities</li>
                  <li className="leading-relaxed">Implemented RPA bots eliminating 10,000+ hours of manual data entry annually</li>
                  <li className="leading-relaxed">Served as primary CAO backup for US GAAP/SOX compliance; supported M&A finance due diligence and integration workstreams</li>
                </ul>
              </div>

              {/* Global Controller */}
              <div className="mb-2.5 no-break role-section">
                <div className="flex justify-between items-baseline mb-0.5">
                  <p className="text-sm font-semibold print-black">Global Controller – Q² Solutions (IQVIA/Quest JV)</p>
                  <span className="text-sm print-gray whitespace-nowrap">Apr 2017 – Dec 2018</span>
                </div>
                <p className="text-sm print-gray mb-1.5 italic leading-relaxed">
                  Oversaw all accounting operations and reporting for joint venture between IQVIA and Quest Diagnostics providing laboratory services for clinical trials.
                </p>
                <ul className="text-sm print-gray space-y-0.5">
                  <li className="leading-relaxed">Managed global accounting operations ensuring compliance with both parent company requirements and regulatory standards</li>
                  <li className="leading-relaxed">Implemented controls and processes supporting rapid growth while maintaining accuracy and timely financial close</li>
                </ul>
              </div>
            </div>

            {/* Siguler Guff */}
            <div className="mb-3 no-break">
              <div className="flex justify-between items-baseline mb-0.5 company-header">
                <h3 className="text-sm font-bold print-black uppercase">SIGULER GUFF & COMPANY, New York, NY</h3>
                <span className="text-sm print-gray font-medium whitespace-nowrap">May 2013 – Apr 2017</span>
              </div>
              <p className="text-sm font-semibold print-black mb-0.5">Vice President – Corporate Controller</p>
              <p className="text-sm print-gray mb-1.5 italic leading-relaxed">
                Directed all accounting and financial operations for $11B AUM private equity firm with eight international offices. Supervised 10-person global finance team.
              </p>
              <ul className="text-sm print-gray space-y-0.5">
                <li className="leading-relaxed">Transformed monthly close process reducing cycle time from 15 to 7 business days</li>
                <li className="leading-relaxed">Led implementation of Concur expense platform cutting processing time by 50%</li>
                <li className="leading-relaxed">Managed complex financial operations including consolidations, GAAP compliance, SOX audits, and broker-dealer regulatory reporting</li>
              </ul>
            </div>

            {/* KKR */}
            <div className="mb-3 no-break">
              <div className="flex justify-between items-baseline mb-0.5 company-header">
                <h3 className="text-sm font-bold print-black uppercase">KOHLBERG KRAVIS ROBERTS (KKR), New York, NY</h3>
                <span className="text-sm print-gray font-medium whitespace-nowrap">Apr 2010 – May 2013</span>
              </div>
              <p className="text-sm font-semibold print-black mb-0.5">Manager – Management Company / Financial Planning & Analysis</p>
              <p className="text-sm print-gray mb-1.5 italic leading-relaxed">
                Founding team member of the FP&A group that assisted in the development of a consolidated Firm operating plan that set high-level Firm-wide goals, provided analysis of performance and highlighted key takeaways for future planning.
              </p>
              <ul className="text-sm print-gray space-y-0.5">
                <li className="leading-relaxed">Co-designed and implemented SAP financial platform serving as new system of record for global operations</li>
                <li className="leading-relaxed">Built competitive benchmarking framework tracking 30+ global business lines against internal and external metrics</li>
                <li className="leading-relaxed">Overhauled quarterly close process to meet public company standards following IPO, improving efficiency by 30%</li>
              </ul>
            </div>

            {/* EY */}
            <div className="mb-3 no-break">
              <div className="flex justify-between items-baseline mb-0.5 company-header">
                <h3 className="text-sm font-bold print-black uppercase">ERNST & YOUNG LLP, New York, NY</h3>
                <span className="text-sm print-gray font-medium whitespace-nowrap">Aug 2005 – Apr 2010</span>
              </div>
              <p className="text-sm font-semibold print-black mb-0.5">Senior Accountant – Financial Services Office</p>
              <p className="text-sm print-gray leading-relaxed">
                Financial services specialist in investment banking and private equity advisory. Notable engagements:
                Apollo Global Management, Bank of America/Merrill Lynch Merger, Bear Stearns Liquidation, UBS Investment Bank,
                National Australian Bank.
              </p>
            </div>
          </div>

          {/* Education */}
          <div className="mb-3 no-break">
            <h2 className="text-base font-bold uppercase print-black mb-1.5 pb-0.5 border-b-2 border-black">EDUCATION</h2>
            <div className="text-sm print-gray space-y-0.5">
              <p className="leading-relaxed"><span className="font-semibold">Master of Business Administration (MBA)</span> | Columbia Business School | 2013-2015 | <span className="italic">Dean&apos;s List</span></p>
              <p className="leading-relaxed"><span className="font-semibold">Bachelor of Science: Accounting (CPA track) & Finance</span> | Syracuse University - Whitman School of Management | 2001-2005 | <span className="italic">Dean&apos;s List, Beta Alpha Psi</span></p>
              <p className="leading-relaxed"><span className="font-semibold">Certified Public Accountant (CPA)</span> | New York State | Active</p>
            </div>
          </div>

          {/* Technology */}
          <div className="no-break">
            <h2 className="text-base font-bold uppercase print-black mb-1.5 pb-0.5 border-b-2 border-black">
              TECHNOLOGY & ADVISORY LEADERSHIP
            </h2>
            <div className="text-sm print-gray">
              <p className="mb-1.5 leading-relaxed">
                <span className="font-semibold">Advisory Board Memberships:</span> Alteryx Visionary Board, AppZen Customer Advisory Board
              </p>
              <p className="mb-0.5 font-semibold">Technology Expertise:</p>
              <ul className="space-y-0.5">
                <li className="leading-relaxed"><span className="font-semibold italic">Analytics &amp; Automation:</span> Alteryx, Tableau, Python, Celonis, Power BI, Microsoft Power Platform</li>
                <li className="leading-relaxed"><span className="font-semibold italic">RPA &amp; AI:</span> AssistEdge, Automation Anywhere, AppZen</li>
                <li className="leading-relaxed"><span className="font-semibold italic">ERP &amp; Financial Systems:</span> SAP, PeopleSoft Financials, Microsoft Dynamics GP, NetSuite, QuickBooks</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

