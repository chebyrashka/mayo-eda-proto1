/* eslint-disable @next/next/no-img-element -- Local static assets; this Workers prototype has no image optimization service. */
'use client';
import { useState, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
	ArrowUp,
	ArrowUpRight,
	ArrowDown,
	ArrowRight,
	Plus,
	X,
	Sparkles,
	Check,
	RotateCcw,
	Layers,
	Globe2,
	Menu,
	MessageSquare,
	Compass,
} from 'lucide-react';

const base = 'https://www.mayoclinicplatform.org';
const resources = [
	{
		id: 'discovery',
		label: 'DISCOVERY',
		title: 'A stronger foundation for your next discovery.',
		description:
			'Explore de-identified clinical data and research capabilities to put your ideas to the test.',
		url: base + '/our-platform/discovery/',
		image: '/research.jpg',
		alt: 'Mayo Clinic researcher studying a wall of clinical data',
		prompt: 'How can I access clinical data for research?',
	},
	{
		id: 'development',
		label: 'DEVELOPMENT',
		title: 'Build with clinical insight from the beginning.',
		description:
			'Bring clinical expertise into the process of developing your digital health solution.',
		url: base + '/our-platform/development/',
		image: '/clinician.jpg',
		alt: 'Clinician examining information on a screen',
		prompt: 'How can I build and validate a healthcare AI solution?',
	},
	{
		id: 'deployment',
		label: 'DEPLOYMENT',
		title: 'Move from a promising pilot to everyday care.',
		description:
			'Explore how solutions connect with clinical workflows and care delivery systems.',
		url: base + '/our-platform/deployment/',
		image: null,
		alt: '',
		prompt: 'How can I bring AI into our clinical workflows?',
	},
];
const paths = {
	discovery: {
		eyebrow: 'FROM QUESTION TO EVIDENCE',
		title: 'Let’s give your idea a foundation.',
		body: 'Start by defining the question you want to answer. Mayo Clinic Platform’s discovery capabilities connect research with curated, de-identified clinical data and feasibility support.',
		steps: [
			'Define your research question',
			'Explore relevant data and feasibility',
			'Plan a validation study',
		],
		follow: [
			'What data can I explore?',
			'Help me outline a research brief',
		],
		ids: ['discovery', 'development'],
	},
	development: {
		eyebrow: 'FROM IDEA TO CLINICAL VALUE',
		title: 'A path from possibility to practice.',
		body: 'Building a healthcare AI solution takes clinical insight as well as technical development. Explore a pathway that brings evidence, clinicians, and the intended care setting into the process.',
		steps: [
			'Establish the clinical use case',
			'Develop and validate with clinical input',
			'Prepare for real-world integration',
		],
		follow: [
			'What does validation involve?',
			'Help me outline a project brief',
		],
		ids: ['development', 'discovery'],
	},
	deployment: {
		eyebrow: 'FROM PILOT TO PRACTICE',
		title: 'Make innovation part of everyday care.',
		body: 'Start with the workflow you want to improve. Mayo Clinic Platform’s deployment resources describe integration, interoperability, and the practical requirements of bringing a solution into a care setting.',
		steps: [
			'Map the workflow and intended benefit',
			'Assess integration and operational readiness',
			'Plan adoption and ongoing evaluation',
		],
		follow: [
			'What should our team prepare?',
			'Help me outline an integration brief',
		],
		ids: ['deployment', 'development'],
	},
};
type PathKey = keyof typeof paths;
function detect(q: string): PathKey | null {
	if (/deploy|workflow|hospital|integrat|provider|care delivery/i.test(q))
		return 'deployment';
	if (/data|research|discover|biopharma/i.test(q)) return 'discovery';
	if (/ai|build|validat|develop|solution|device|digital|model/i.test(q))
		return 'development';
	return null;
}
export default function Experience() {
	const [input, setInput] = useState('');
	const [question, setQuestion] = useState('');
	const [path, setPath] = useState<PathKey | null>(null);
	const [busy, setBusy] = useState(false);
	const [context, setContext] = useState<string[]>([]);
	const [followup, setFollowup] = useState('');
	const [brief, setBrief] = useState(false);
	const [mobile, setMobile] = useState(false);
	const [selected, setSelected] = useState('All perspectives');
	const [mode, setMode] = useState<'ask' | 'discover'>('ask');
	const askPanel = useRef<HTMLDivElement>(null);
	const discoverPanel = useRef<HTMLDivElement>(null);
	const wheelIntent = useRef({ total: 0, time: 0 });
	const touchStart = useRef<number | null>(null);
	const textarea = useRef<HTMLTextAreaElement>(null);
	const request = useRef(0);
	function switchMode(
		next: 'ask' | 'discover',
		anchor?: string,
		focusContent = true,
	) {
		setMode(next);
		setMobile(false);
		wheelIntent.current = { total: 0, time: 0 };
		requestAnimationFrame(() =>
			requestAnimationFrame(() => {
				if (anchor) {
					document
						.getElementById(anchor)
						?.scrollIntoView({
							block: 'start',
							behavior: 'instant',
						});
				}
				if (focusContent) {
					if (next === 'ask') {
						textarea.current?.focus({ preventScroll: true });
						textarea.current?.scrollIntoView({
							block: 'nearest',
							behavior: 'instant',
						});
					} else {
						discoverPanel.current?.focus({ preventScroll: true });
					}
				}
			}),
		);
	}
	function atAskBoundary() {
		const el = askPanel.current;
		return !!el && el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
	}
	function wheelToDiscover(e: React.WheelEvent<HTMLDivElement>) {
		if (
			active ||
			mode !== 'ask' ||
			e.ctrlKey ||
			Math.abs(e.deltaX) > Math.abs(e.deltaY) ||
			(e.target as HTMLElement).closest('textarea,button,a') ||
			!atAskBoundary()
		)
			return;
		const now = e.timeStamp;
		const delta =
			e.deltaY *
			(e.deltaMode === 1
				? 16
				: e.deltaMode === 2
					? window.innerHeight
					: 1);
		if (delta <= 0 || now - wheelIntent.current.time > 220)
			wheelIntent.current.total = 0;
		wheelIntent.current.time = now;
		wheelIntent.current.total += Math.max(0, delta);
		if (wheelIntent.current.total > 150) switchMode('discover');
	}

	const active = question.length > 0;
	const result = path ? paths[path] : null;
	function ask(q: string) {
		q = q.trim();
		if (!q || busy) return;
		setQuestion(q);
		setInput('');
		setFollowup('');
		setBrief(false);
		setBusy(true);
		const token = ++request.current;
		const match =
			detect(q) ||
			(context[context.length - 1] as PathKey) ||
			path ||
			null;
		setPath(match);
		switchMode('ask', undefined, false);
		askPanel.current?.scrollTo({ top: 0, behavior: 'instant' });
		setTimeout(() => {
			if (request.current === token) setBusy(false);
		}, 850);
	}
	function reset() {
		request.current++;
		setBusy(false);
		setQuestion('');
		setPath(null);
		setFollowup('');
		setBrief(false);
		setInput('');
		setContext([]);
		switchMode('ask', undefined, false);
		askPanel.current?.scrollTo({ top: 0, behavior: 'instant' });
		setTimeout(() => textarea.current?.focus({ preventScroll: true }), 100);
	}
	function bring(id: string) {
		setContext((c) => (c.includes(id) ? c : [...c, id]));
		setInput(resources.find((r) => r.id === id)?.prompt || '');
		switchMode('ask', undefined, false);
		askPanel.current?.scrollTo({ top: 0, behavior: 'instant' });
		setTimeout(() => {
			textarea.current?.focus({ preventScroll: true });
			textarea.current?.scrollIntoView({
				block: 'nearest',
				behavior: 'smooth',
			});
		}, 350);
	}
	function follow(q: string) {
		if (/brief/i.test(q)) {
			setBrief(true);
			setFollowup('');
		} else {
			setBrief(false);
			setFollowup(
				path === 'discovery'
					? 'Begin with the population, clinical question, and outcomes you want to study. The discovery overview describes data access and feasibility support; availability for your specific use case needs to be discussed with the Platform team.'
					: path === 'deployment'
						? 'Bring a description of the current workflow, the systems involved, and how you would measure improvement. Identify the clinical, IT, and operational stakeholders who would help evaluate a potential integration.'
						: 'Clarify the intended use, target population, and measures of success. The discovery and development resources describe study support and clinical collaboration; the appropriate validation plan depends on the particular solution.',
			);
		}
	}
	return (
		<Tabs
			value={mode}
			onValueChange={(value) =>
				switchMode(value as 'ask' | 'discover', undefined, false)
			}
			className="experience-shell"
			data-mode={mode}
		>
			<a
				className="skip"
				href="#ask-input"
				onClick={(e) => {
					e.preventDefault();
					switchMode('ask');
				}}
			>
				Skip to ask
			</a>
			<header className="header">
				<button
					onClick={() => switchMode('ask')}
					className="brand"
					aria-label="Mayo Clinic Platform home"
				>
					<img
						src="/logo.svg"
						alt="Mayo Clinic Platform"
						width="190"
						height="42"
					/>
				</button>
				<span className="mode-caption">
					{mode === 'ask'
						? 'A SPACE FOR POSSIBILITY'
						: 'THE PLATFORM, EXPLORED'}
				</span>
				<nav
					aria-label="Main navigation"
					className={
						(mobile ? 'navigation is-open' : 'navigation') +
						(mode === 'ask' ? ' ask-navigation' : '')
					}
				>
					<button
						onClick={() => switchMode('discover', 'possibilities')}
					>
						Our platform
					</button>
					<button onClick={() => switchMode('discover', 'resources')}>
						Resources
					</button>
					<a href={base + '/about/'} target="_blank" rel="noreferrer">
						About us <ArrowUpRight size={13} />
					</a>
				</nav>
				<div className="header-right">
					<span className="concept">
						<span /> CONCEPT
					</span>
					<button
						className="menu"
						onClick={() => setMobile(!mobile)}
						aria-expanded={mobile}
						aria-label="Toggle navigation"
					>
						<Menu />
					</button>
				</div>
			</header>
			<main className="experience-stage">
				<TabsContent
					value="ask"
					keepMounted
					ref={askPanel}
					className="experience-panel ask-panel"
					onWheel={wheelToDiscover}
					onTouchStart={(e) => {
						touchStart.current = (e.target as HTMLElement).closest(
							'textarea,button,a',
						)
							? null
							: e.touches[0].clientY;
					}}
					onTouchEnd={(e) => {
						if (
							!active &&
							touchStart.current !== null &&
							touchStart.current - e.changedTouches[0].clientY >
								90 &&
							atAskBoundary()
						)
							switchMode('discover');
						touchStart.current = null;
					}}
				>
					<section
						className={'ask-section ' + (active ? 'is-active' : '')}
						id="ask"
					>
						<div className="ambient" aria-hidden="true" />
						<div className="section-coordinate">
							<span>01 — ASK</span>
							<span>YOUR AMBITION. OUR SHARED POSSIBILITY.</span>
						</div>
						<div className={active ? 'ask-workspace' : 'ask-intro'}>
							{!active ? (
								<>
									<div className="eyebrow">
										<span className="spark-icon">
											<Sparkles size={15} />
										</span>{' '}
										A BETTER FUTURE STARTS WITH A QUESTION
									</div>
									<h1>
										Think bigger.
										<br />
										Ask <em>what if.</em>
									</h1>
									<p className="intro-copy">
										What would you change about healthcare?
										Let’s start there.
									</p>
								</>
							) : (
								<div className="conversation-top">
									<span className="eyebrow">
										<Sparkles size={16} /> YOUR EXPLORATION
									</span>
									<button
										onClick={reset}
										className="text-button"
									>
										<RotateCcw size={14} /> Start fresh
									</button>
								</div>
							)}
							{active && (
								<div
									className="response"
									aria-live="polite"
									aria-busy={busy}
								>
									<p className="user-question">{question}</p>
									{busy ? (
										<div className="thinking">
											<span />
											<span />
											<span />
											<p>
												Finding a path through the
												platform…
											</p>
										</div>
									) : result ? (
										<div className="answer-grid">
											<div className="answer-main">
												<div className="mini-label">
													{result.eyebrow}
												</div>
												<h2>{result.title}</h2>
												<p>{result.body}</p>
												<div className="pathway">
													{result.steps.map(
														(s, i) => (
															<div key={s}>
																<span>
																	{String(
																		i + 1,
																	).padStart(
																		2,
																		'0',
																	)}
																</span>
																<p>{s}</p>
																{i < 2 && (
																	<ArrowRight
																		size={
																			15
																		}
																	/>
																)}
															</div>
														),
													)}
												</div>
												{followup && (
													<p className="follow-answer">
														{followup}
													</p>
												)}
												{brief && (
													<div className="brief">
														<span className="mini-label">
															YOUR STARTING BRIEF
														</span>
														<h3>{question}</h3>
														<p>
															<b>Explore:</b>{' '}
															{result.steps[0]}.
															<br />
															<b>Prepare:</b> Your
															intended users,
															current approach,
															and desired outcome.
															<br />
															<b>Discuss:</b>{' '}
															Feasibility,
															evidence needs, and
															the right next step
															with the Platform
															team.
														</p>
														<a
															href={
																base +
																'/contact/'
															}
															target="_blank"
															rel="noreferrer"
														>
															Continue with the
															Platform team{' '}
															<ArrowUpRight
																size={15}
															/>
														</a>
													</div>
												)}
												<div className="followups">
													{result.follow.map((f) => (
														<button
															onClick={() =>
																follow(f)
															}
															key={f}
														>
															{f}
															<Plus size={14} />
														</button>
													))}
												</div>
											</div>
											<aside className="related">
												<div className="mini-label">
													A FEW PLACES TO START
												</div>
												{result.ids.map((id) => {
													const r = resources.find(
														(r) => r.id === id,
													)!;
													return (
														<a
															href={r.url}
															target="_blank"
															rel="noreferrer"
															key={id}
														>
															<span>
																{r.label}
															</span>
															<h3>{r.title}</h3>
															<ArrowUpRight
																size={19}
															/>
															<small>
																View source on
																Mayo Clinic
																Platform
															</small>
														</a>
													);
												})}
												<p>
													<Check size={13} /> Drawn
													from Platform resources
												</p>
											</aside>
										</div>
									) : (
										<div className="unmatched">
											<h2>
												Let’s find the right starting
												point.
											</h2>
											<p>
												This concept explores Mayo
												Clinic Platform’s work in
												healthcare innovation. Choose a
												direction below, or tell me
												about your data, solution, or
												clinical workflow.
											</p>
											<div className="followups">
												{resources.map((r) => (
													<button
														key={r.id}
														onClick={() =>
															ask(r.prompt)
														}
													>
														{r.label.toLowerCase()}{' '}
														<ArrowRight size={15} />
													</button>
												))}
											</div>
										</div>
									)}
								</div>
							)}
							<form
								className="composer"
								onSubmit={(e) => {
									e.preventDefault();
									ask(input);
								}}
							>
								{context.length > 0 && (
									<div className="context-items">
										{context.map((id) => (
											<span key={id}>
												<Layers size={12} />
												{
													resources.find(
														(r) => r.id === id,
													)?.label
												}
												<button
													type="button"
													aria-label={
														'Remove ' +
														id +
														' context'
													}
													onClick={() =>
														setContext((c) =>
															c.filter(
																(x) => x !== id,
															),
														)
													}
												>
													<X size={12} />
												</button>
											</span>
										))}
									</div>
								)}
								<label className="sr-only" htmlFor="ask-input">
									Ask about healthcare innovation
								</label>
								<Textarea
									id="ask-input"
									ref={textarea}
									value={input}
									onChange={(e) => setInput(e.target.value)}
									placeholder={
										active
											? 'Ask a follow-up, or take a new direction…'
											: 'What would you like to make possible?'
									}
									rows={active ? 1 : 2}
									maxLength={1500}
									onKeyDown={(e) => {
										if (
											e.key === 'Enter' &&
											!e.shiftKey &&
											!e.nativeEvent.isComposing
										) {
											e.preventDefault();
											ask(input);
										}
									}}
								/>
								<div className="composer-bottom">
									<span>
										<Sparkles size={14} /> Explore with
										Platform
									</span>
									<button
										type="submit"
										aria-label="Explore your question"
										disabled={!input.trim() || busy}
									>
										<ArrowUp size={21} />
									</button>
								</div>
							</form>
							{!active && (
								<div className="suggestions">
									<span>START WITH A POSSIBILITY</span>
									<div>
										<button
											onClick={() =>
												ask(
													'How can I build and validate a healthcare AI solution?',
												)
											}
										>
											Build a healthcare AI solution{' '}
											<ArrowUpRight size={14} />
										</button>
										<button
											onClick={() =>
												ask(
													'How can I access clinical data for research?',
												)
											}
										>
											Explore clinical data{' '}
											<ArrowUpRight size={14} />
										</button>
										<button
											onClick={() =>
												ask(
													'How can I bring AI into our clinical workflows?',
												)
											}
										>
											Transform care delivery{' '}
											<ArrowUpRight size={14} />
										</button>
									</div>
								</div>
							)}
							<p className="demo-note">
								Interactive concept · Curated sample responses ·
								Please don’t enter patient information.
							</p>
						</div>
						<button
							className="experience-portal"
							onClick={() => switchMode('discover')}
						>
							<span className="portal-label">
								A DIFFERENT WAY IN
							</span>
							<span className="portal-title">
								Step inside the platform <ArrowDown size={20} />
							</span>
							<span className="portal-hint">
								Scroll or click to discover
							</span>
						</button>
					</section>
				</TabsContent>
				<TabsContent
					value="discover"
					keepMounted
					ref={discoverPanel}
					className="experience-panel discover-panel"
				>
					<section
						className="possibilities content-section"
						id="possibilities"
					>
						<div className="section-heading">
							<div>
								<span className="eyebrow">
									02 — DISCOVER THE PLATFORM
								</span>
								<h2>
									Big ideas.
									<br />
									<em>Real-world impact.</em>
								</h2>
							</div>
							<p>
								Clinical knowledge, connected data, and a shared
								purpose. Discover what becomes possible when the
								right people and ideas come together.
							</p>
						</div>
						<div className="feature-panel">
							<img
								src="/research.jpg"
								alt="A clinician explores data to support healthcare research"
								loading="lazy"
							/>
							<div className="feature-copy">
								<span className="eyebrow">
									BUILT AROUND BETTER CARE
								</span>
								<h3>
									The next breakthrough
									<br />
									starts with connection.
								</h3>
								<p>
									Explore a platform that brings data,
									clinical expertise, and digital health
									innovation into the same conversation.
								</p>
								<button
									className="light-button"
									onClick={() =>
										ask(
											'How can I build and validate a healthcare AI solution?',
										)
									}
								>
									Find your way forward{' '}
									<ArrowUpRight size={18} />
								</button>
							</div>
						</div>
					</section>
					<section
						id="resources"
						className="resources content-section"
					>
						<div className="section-heading">
							<div>
								<span className="eyebrow">
									03 / FOLLOW YOUR CURIOSITY
								</span>
								<h2>
									One platform.
									<br />
									<em>Many starting points.</em>
								</h2>
							</div>
							<p>
								Explore on your own terms. Find something
								interesting? Bring it into your conversation.
							</p>
						</div>
						<div
							className="perspectives"
							aria-label="Filter resources"
						>
							{[
								'All perspectives',
								'Research & discovery',
								'Building solutions',
								'Delivering care',
							].map((s, i) => (
								<button
									aria-pressed={selected === s}
									key={s}
									onClick={() => setSelected(s)}
								>
									{s}
									{i === 0 && <span>03</span>}
								</button>
							))}
						</div>
						<div className="resource-grid">
							{resources
								.filter(
									(r) =>
										selected === 'All perspectives' ||
										r.id ===
											(
												{
													'Research & discovery':
														'discovery',
													'Building solutions':
														'development',
													'Delivering care':
														'deployment',
												} as Record<string, string>
											)[selected],
								)
								.map((r) => (
									<article
										className={
											'resource-card ' +
											(!r.image ? 'blue-card' : '')
										}
										key={r.id}
									>
										{r.image ? (
											<a
												href={r.url}
												target="_blank"
												rel="noreferrer"
												className="card-image"
											>
												<img
													src={r.image}
													alt={r.alt}
													loading="lazy"
												/>
												<span>
													<ArrowUpRight size={21} />
												</span>
											</a>
										) : (
											<div className="deployment-art">
												<Globe2
													size={56}
													strokeWidth={0.7}
												/>
												<span>
													INNOVATION,
													<br />
													IN PRACTICE.
												</span>
												<ArrowUpRight size={25} />
											</div>
										)}
										<div className="card-body">
											<span className="mini-label">
												{r.label}
											</span>
											<h3>
												<a
													href={r.url}
													target="_blank"
													rel="noreferrer"
												>
													{r.title}
												</a>
											</h3>
											<p>{r.description}</p>
											<button
												className="context-button"
												onClick={() => bring(r.id)}
											>
												{context.includes(r.id) ? (
													<Check size={15} />
												) : (
													<Plus size={15} />
												)}{' '}
												{context.includes(r.id)
													? 'In your exploration'
													: 'Explore this with me'}
												<ArrowUpRight size={15} />
											</button>
										</div>
									</article>
								))}
						</div>
					</section>
					<section className="closing">
						<span className="eyebrow">
							THE NEEDS OF THE PATIENT COME FIRST.
						</span>
						<h2>
							What will we make
							<br />
							<em>possible together?</em>
						</h2>
						<button className="light-button" onClick={reset}>
							Start with a question <ArrowUpRight size={18} />
						</button>
					</section>
					<footer>
						<button
							onClick={() => switchMode('ask')}
							className="brand"
						>
							<img
								src="/logo.svg"
								alt="Mayo Clinic Platform"
								width="190"
								height="42"
							/>
						</button>
						<p>
							A design exploration. Not an official Mayo Clinic
							service.
						</p>
						<a href={base} target="_blank" rel="noreferrer">
							Visit Mayo Clinic Platform{' '}
							<ArrowUpRight size={14} />
						</a>
					</footer>
				</TabsContent>
			</main>
			<div className="mode-dock">
				<div className="mode-dock-inner">
					<TabsList
						className="mode-switch"
						aria-label="Choose your experience"
					>
						<TabsTrigger value="ask">
							<MessageSquare size={17} /> Ask
							{active && (
								<span
									className="conversation-dot"
									aria-label="Conversation in progress"
								/>
							)}
						</TabsTrigger>
						<TabsTrigger value="discover">
							<Compass size={18} /> Discover
						</TabsTrigger>
					</TabsList>
					<span className="dock-caption">
						{mode === 'ask'
							? 'Start with a question'
							: 'Follow your curiosity'}
						{active && mode === 'discover' && (
							<span> · Your conversation is waiting</span>
						)}
					</span>
				</div>
			</div>
		</Tabs>
	);
}
