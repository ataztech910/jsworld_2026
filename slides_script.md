# Fixing Backend Delivery DX with a Frontend Mindset
### ~30 slides · ~35 min · ~130-150 words per slide

---

## SLIDE 1 — Title
**On slide:**
```
Fixing Backend Delivery DX
with a Frontend Mindset
```
*Your name / conference / date*

**Notes:** *(walk to position, let it sit 4-5 seconds, look at the audience, then start)*

---

## SLIDE 2 — The core idea
**On slide:**
```
We write software to solve problems.
```

**Notes:** This sounds obvious. Almost too obvious to say out loud at a tech conference. But I want you to hold this thought for the next 35 minutes — because I genuinely think we forgot it somewhere along the way. Not intentionally. Not all at once. But gradually, quietly, in the way that things drift when nobody is watching. The history of software engineering is really a history of automation. Every generation of engineers looked at the complexity below them and said: we can automate this away. And they did. Assembly was painful — we built higher-level languages. Manual builds were slow and error-prone — we built make, gradle, npm. Compilation, dependency management, testing — each one automated away. Each one a problem that disappeared from the developer's daily cognitive load. That was the standard. That was the bar.

---

## SLIDE 3 — The twist
**On slide:**
```
Not to create new ones.
```

**Notes:** But at some point something shifted. We started building tools that solve one problem and quietly introduce three new ones. And we got so used to it that we stopped noticing. We called it "the ecosystem." We called it "the learning curve." We called it being a senior engineer — knowing all the things you need to know before you can do the thing you actually came to do. I want to challenge that framing today. Not because the tools are bad. Most of them are genuinely impressive engineering. But impressive engineering and good developer experience are not the same thing. And I think we've been confusing them for a while now. So let's talk about where this goes wrong — and what it looks like when it goes right.

---

## SLIDE 4 — Something shifted
**On slide:**
```
At some point we stopped removing complexity.

We started relocating it.
```

**Notes:** There's a difference between removing a problem and moving it somewhere less visible. When npm automated dependency management, you stopped thinking about tracking library versions. The problem was gone. When Webpack automated module bundling, you stopped thinking about manually concatenating scripts. Gone. But somewhere along the way we started building tools that take a problem, wrap it in a new abstraction, give it a new name, and hand it back to you. The problem is still there — it's just wearing a different hat. And we have to ask honestly: is our deployment tooling removing problems, or is it relocating them? Is it simplifying the developer's job, or is it creating a new job called "understand the deployment tooling"?

---

## SLIDE 5 — AI won't fix this
**On slide:**
```
"Just ask AI."
```

**Notes:** I know what some of you are thinking right now. We have AI. Copilot, ChatGPT, Claude — whatever you use. You don't know the gcloud command? Ask AI. Don't understand the Dockerfile? Ask AI. Don't know why your IAM permissions are failing? Ask AI and it'll explain it in plain English. And yes — this genuinely helps. I use it too. If you're stuck on an error message at 11pm, having an AI explain it in plain language is much better than reading three Stack Overflow posts from 2019. I'm not dismissing that. But I want to make a distinction that I think is important. Because I think we're starting to use AI as a reason to not fix the underlying problems. "It's fine, developers can just ask AI" is becoming a justification for leaving bad DX in place.

---

## SLIDE 6 — The difference
**On slide:**
```
AI makes complexity tolerable.

Real automation makes it disappear.
```

**Notes:** Here's the distinction I want to make. AI makes complexity tolerable. It gives you a better interface to deal with things that are hard. But it doesn't remove the need to deal with them. You still need to understand enough to know what to ask. You still need to verify the output. You still need to know when it's wrong — and it is wrong sometimes, especially on cloud-specific configurations. The cognitive layer is still there. AI just made it slightly thinner. Real automation — the kind that made Heroku powerful in its time, the kind that makes Vercel what it is today — doesn't make complexity tolerable. It removes the need to think about it at all. You don't ask AI how to configure your Vercel deployment. You don't think about it. It just works. That's a fundamentally different thing. And that's the standard I want to talk about today.

---

## SLIDE 7 — Lefty setup
**On slide:**
```
A 19th century Russian story
about a craftsman and a flea.
```

**Notes:** I want to share a story that stuck with me. It's from a 19th century Russian novella by Nikolai Leskov — "Lefty." The story goes like this. The English have built a mechanical flea — a tiny, perfect piece of engineering. It's made of steel, it has joints, and it dances. The Russian Tsar sees it and is amazed. He brings it back to Russia and shows it to his craftsmen. The implication is clear: can you do something with this? Can you prove that Russian craftsmen are as good as the English? And they try. They study the flea, they work on it in secret for weeks, and eventually they come back. They've done something remarkable. Something that required extraordinary skill and precision.

---

## SLIDE 8 — The punchline
**On slide:**
```
The craftsman shoed the flea.

Microscopic horseshoes.
A masterwork.

The flea no longer dances.
```

**Notes:** A craftsman called Lefty shoed the flea. Tiny horseshoes — on microscopic mechanical feet. Each horseshoe with the craftsman's name engraved on it, too small to see with the naked eye. Technically breathtaking. Nobody in the world could do this. The craftsmen are proud, the Tsar is amazed. But then someone looks more carefully. The flea no longer dances. The mechanism that made it work — the delicate calibration of its tiny joints — was disrupted by the very improvement that was meant to prove its value. The craftsmen were so focused on demonstrating their skill that they forgot to ask: does the thing still do what it's supposed to do? We do this with developer tooling all the time. We build something technically brilliant on top of a problem — and the original thing stops working.

---

## SLIDE 9 — The real question
**On slide:**
```
Is your tool solving the problem?

Or is it the horseshoe?
```

**Notes:** This is the question I want you to carry through the rest of this talk. Not "is this tool well-engineered" — it probably is. Not "is this better than the alternative" — maybe. But: does the original thing still dance? Does the developer still ship? Or are they now spending their time learning the tool that was supposed to help them ship? I'm not saying complexity is always avoidable. Some things are genuinely hard and they should be hard. But there's a difference between necessary complexity and accidental complexity — complexity we introduced ourselves and then forgot to question. A lot of backend deployment tooling falls into that second category. And I want to show you how I started seeing that — from an unlikely angle.

---

## SLIDE 10 — Personal story setup
**On slide:**
```
I was a frontend developer
at a backend startup.
```

**Notes:** Let me tell you about the moment I first noticed this gap personally. I was working at a startup. Small team — two backend engineers and me, the frontend developer. We were building a product, things were going well, and we were getting ready for our first production release. It felt like a big moment. We'd been working toward this for months. The backend engineers were doing their thing — Go services, databases, all of it. I was handling the frontend. And when it came time to actually ship everything to production, my colleagues turned to me and said — hey, can you handle the deploy? You've done this before, right?

---

## SLIDE 11 — The moment
**On slide:**
```
"Just merge to prod.
It'll deploy automatically."

— me
```

**Notes:** So I did what I always do. I merged all the development branches into the production branch. And I waited. Because on Vercel, on AWS Amplify — that's how it works. You push to the production branch, the platform picks it up, runs the build, deploys it. The whole thing takes a few minutes and you get a notification. I'd done this dozens of times. It was completely automatic. So I merged, opened a new tab, and waited for the notification. My colleagues were looking at me. I told them — it's fine, it'll deploy automatically. Give it a minute.

---

## SLIDE 12 — The realization
**On slide:**
```
Nothing happened.
```

**Notes:** Nothing happened. And here's the thing — they weren't doing anything wrong. They had a DevOps engineer. They had pipelines. Everything was correctly set up for their workflow — a workflow that required someone to actually trigger the build, monitor it, and confirm the deploy. That's a completely normal and reasonable setup. The problem was entirely me. I had spent the last few years on platforms where the pipeline is part of the product — where someone else made all the deployment decisions so I didn't have to. And I had become so accustomed to that world that I'd completely forgotten the other world existed. I wasn't just surprised. I was genuinely confused. That feeling — "wait, this doesn't just happen?" — didn't leave me. And it made me start asking a question I hadn't asked before.

---

## SLIDE 13 — The question it raised
**On slide:**
```
Why does the frontend world have this
and the backend world doesn't?
```

**Notes:** Why does the frontend ecosystem have platforms that just handle it — and the backend ecosystem doesn't? Now, I want to be precise — because I know what some of you are thinking. Yes, there are solutions. Laravel Cloud launched in February 2025 — zero-config, managed databases, auto-scaling, no DevOps required. Deno Deploy — zero-config deployment for JS and TypeScript apps. Rails has Kamal built in since Rails 8. These are real, and some of them are genuinely impressive. But notice the pattern. Each ecosystem built its own solution, for itself, in isolation. Laravel Cloud is Laravel-only. Deno Deploy is Deno-only. Kamal works if you bring your own servers and know Docker. These aren't universal standards — they're each community solving the same problem independently. Go developers don't have this. Python doesn't have this. Java doesn't. Rust doesn't. And even where it exists, it's fragmented enough that a developer still has to go find it, evaluate it, and figure out if it fits. That decision-making burden — that's exactly what we're trying to remove.

---

## SLIDE 14 — The ecosystem map
**On slide:**
```
JavaScript / TS  →  Vercel, Deno Deploy      ✓
PHP / Laravel    →  Laravel Cloud             ✓
Ruby / Rails     →  Kamal (bring your own server) ⚠

Go               →                            ✗
Python           →                            ✗
Java             →                            ✗
Rust             →                            ✗
```

**Notes:** So let's look at this honestly. Which ecosystems have solved this problem — and which haven't. JavaScript and TypeScript have Vercel and Deno Deploy. Zero-config, push to deploy, no infrastructure thinking required. PHP and Laravel got Laravel Cloud in February 2025 — fully managed, zero-config, built by the Laravel team itself. Ruby has Kamal bundled with Rails 8 — it simplifies things significantly, but you still bring your own server and you still need to know Docker. And then there's Go, Python, Java, Rust — nothing. No official platform, no community standard, no zero-config path built by the people who know the ecosystem best. Notice the pattern here. The ecosystems that solved this problem all had one thing in common — a strong centralized leadership that decided to own the deployment story. The Go team at Google never did that. The Python community never did that. So developers are left with generic cloud platforms that don't understand their stack. That gap is real. And it's exactly where the pain lives.

---

## SLIDE 15 — The conversation that stuck with me
**On slide:**
```
"But how does it know what to build?
Who configures the pipeline?
Where are the build steps?"

— a DevOps engineer, day two of the conversation
```

**Notes:** I want to share another moment that made this gap very concrete for me. I spent almost two days trying to explain to a DevOps engineer how Vercel works. Not two hours — two days. He was experienced, smart, knew infrastructure deeply. But he genuinely could not understand how a platform could deploy an application without a configured pipeline. Every question he asked came from the same assumption: someone must have set this up somewhere. Someone must have written the build steps. Someone must have configured what happens on push. And I kept saying — no, it just detects it. It just knows. And he kept saying — but how? That conversation stuck with me. It wasn't that he was wrong. It was that his entire mental model of deployment was built around the idea that configuration is required. That pipelines have to be written. That someone has to make all these decisions. Vercel had made those decisions so invisible that a senior infrastructure engineer couldn't believe they existed at all.

---

## SLIDE 16 — Why frontend feels different
**On slide:**
```
Vercel didn't make deployment easier.

They made it disappear.
```

**Notes:** When I think about why frontend delivery feels lightweight, I keep coming back to this distinction. Vercel didn't just make deployment easier — they made it something you don't think about. And those are very different things. Making something easier means you still do it, but with less friction. Making it disappear means it's no longer part of your cognitive load at all. A junior developer deploying their first Next.js app doesn't think about CDN configuration, edge caching, build optimization, or environment setup. Those things are happening — they're real and they matter — but they're invisible. The developer's job is to write code and push it. Everything else just works. How did they achieve that? Three principles. And I think these principles can apply to backend delivery too.

---

## SLIDE 15 — Principle 1: Detect
**On slide:**
```
Auto-detection.

The platform figures out what you have.
You don't tell it.
```

**Notes:** The first principle is auto-detection. You push a Next.js project — the platform knows it's Next.js. You push a Remix app, an Astro site, a SvelteKit project — it recognizes them. You don't write a config file that says "this is a Next.js project, please use the Next.js build pipeline." The platform reads your project and figures it out. This sounds like a small thing. It isn't. Because it means the developer's first action when they want to deploy something is writing code — not writing configuration that describes the code they're about to write. The absence of that first config step changes the entire onboarding experience. It's the difference between "let me show you how this works" and "before we start, you need to fill out this form."

---

## SLIDE 16 — Principle 2: Decide
**On slide:**
```
Zero-config defaults.

Reasonable decisions made once,
not by every developer every time.
```

**Notes:** The second principle is zero-config defaults. Once the platform knows what you have, it makes decisions for you. Build command, output directory, environment setup, caching strategy — all of it. These are decisions that someone made once, carefully, based on what works for most projects. And every developer who comes after benefits from those decisions without knowing they exist. This is subtle but important. It means the collective knowledge of "how to deploy a Next.js app correctly" lives in the platform — not in a wiki page, not in tribal knowledge that only the senior engineer has, not in a 40-step onboarding doc. It's encoded. It's automatic. And when you do need to override it — you can. But you don't have to understand it before you can start.

---

## SLIDE 17 — Principle 3: Defer
**On slide:**
```
Progressive complexity.

Simple things simple.
Advanced things possible — not required.
```

**Notes:** The third principle is progressive complexity. If you need custom configuration — it's there. Edge functions, custom headers, advanced caching rules, monorepo setup — all available. But you don't need to understand any of it before you deploy your first project. The complexity is deferred until you actually need it. This is the one I think about most because it's the one the backend world gets most wrong. On the backend, complexity is front-loaded. You can't deploy without first understanding IAM, registries, build pipelines. The advanced stuff isn't optional — it's a prerequisite. Progressive complexity flips that. Start simple. Ship something. Learn the deeper layers when you have a reason to — when you have a running service and a real problem to solve.

---

## SLIDE 18 — Backend reality
**On slide:**
```
To deploy a Go service from scratch:
```

**Notes:** Okay. So we understand what made frontend delivery feel lightweight. Now let's look at what the backend equivalent actually looks like. I want to walk through the standard path for deploying a Go service for the first time on a major cloud provider. And I want you to notice two things as I show you this. First — how many steps there are before you write any business logic. Second — how each step assumes knowledge from the previous one. This isn't a made-up worst case. This is just the standard path. This is what a developer encounters when they search "how to deploy Go service to cloud" and follow the documentation.

---

## SLIDE 19 — The list
**On slide:**
```
1. Install the CLI
2. Configure a project
3. Enable required APIs
4. Set up a container registry
5. Configure service account + IAM roles
6. Write a Dockerfile (or learn Buildpacks)
7. Set up a build pipeline
8. Deploy

9. Write some code?
```

**Notes:** Every single step here requires knowledge of the previous one. If you don't understand what a service account is, you can't configure the IAM roles. If you don't understand the registry, you can't configure the build pipeline. If you've never written a Dockerfile, step six is its own rabbit hole — or you learn what Buildpacks are, which is a different rabbit hole. It's a dependency chain of infrastructure knowledge that has nothing to do with whether your service actually works, whether your business logic is correct, whether your API does what it's supposed to do. And I want to be fair here — none of these tools are bad. Cloud Run is genuinely excellent infrastructure once you understand it. But "once you understand it" is doing a lot of work in that sentence. Understanding it is the entire job before you can start the actual job.

---

## SLIDE 20 — Not all stacks are equal
**On slide:**
```
Not all stacks have the same story.
```

**Notes:** Here's something that makes this problem more interesting. The right deployment target actually depends on your stack — and most developers don't know this until they pick the wrong one and spend a day figuring out why it doesn't work. This isn't documented anywhere in a simple way. It's the kind of thing you learn through experience or through asking the right person at the right time. And it's exactly the kind of knowledge that should live in a tool rather than in someone's head. Let me show you what I mean.

---

## SLIDE 21 — The comparison
**On slide:**
```
Go    →  single binary  →  Lambda ✓   Cloud Run ✓
Node  →  SSR / runtime  →  Lambda ⚠   Cloud Run ✓
Ruby  →  needs runtime  →  Lambda ✗   Cloud Run ✓
PHP   →  needs runtime  →  Lambda ✗   Cloud Run ✓
```

**Notes:** Go compiles to a single binary. No runtime dependencies. Fast cold starts. Almost perfect for Lambda — zip it up and you're done. Cloud Run works great too. Real options, both reasonable. Node with server-side rendering is a different story. You can get it into Lambda but you need an adapter layer — it's not natural, it adds complexity. Cloud Run handles it cleanly because it just runs a container and doesn't care about the runtime. Ruby and PHP need a custom runtime or Docker packaging to run on Lambda. It's technically possible but it's not the simple path — it's a project in itself. Cloud Run works because again, it's just a container. The point isn't that one platform is better. The point is that this decision — which platform fits your stack — can be automated. A tool that detects your stack can apply the right default, suggest the right target. This is knowledge that should live in tooling, not in a developer's head on day one.

---

## SLIDE 22 — Where the problem came from
**On slide:**
```
These tools weren't built for developers.

They were built for ops engineers.
Then every developer became responsible
for their own deployment.

The tools didn't change.
The audience did.
```

**Notes:** I want to take a second to be fair about why this happened — because I don't think it's anyone's fault. gcloud, kubectl, terraform — these are genuinely powerful tools. They were built for infrastructure engineers who manage systems at scale. People who think in terms of networks, permissions, resource quotas, blast radius. That's a real job and those tools do it well. But then the industry moved toward microservices, toward every team owning their own deployment. And suddenly every backend developer was expected to also be a little bit of an ops engineer. The tools didn't change to meet them. The assumption was that developers would learn the tools. And some did. But a lot just got stuck.

---

## SLIDE 23 — The right order
**On slide:**
```
The order you encounter things
shapes how you understand them.
```

**Notes:** I want to propose a different order of learning. Not because infrastructure doesn't matter — it absolutely does. A developer who understands their infrastructure is a better developer. But the order in which you encounter things shapes how you understand them. A developer who spends week one writing business logic — building something that actually does something, solving an actual problem — has a completely different relationship with infrastructure when they eventually get there. They understand why they need it. They have a real service running and a real problem to solve. The complexity has context. Versus a developer who spends week one fighting IAM permissions before they've written a single meaningful line of code. That developer has learned a lot about cloud platforms and almost nothing about software design.

---

## SLIDE 24 — Progressive path
**On slide:**
```
Day 1:    Write logic. Ship something.
Day 30:   Understand what's running it.
Day 90:   Own the infrastructure.
```

**Notes:** This is the order that makes sense to me. Day one — write logic, ship something, see it work. It doesn't need to be perfect infrastructure. It needs to be running so you have something real to work with. Day thirty — you've shipped a few things, you're hitting real constraints, you start understanding what's actually running your service and why it's configured the way it is. That knowledge has context now. Day ninety — you're ready to own the infrastructure, make intentional decisions, maybe even push back on defaults. You've earned the complexity because you understand what it's for. Progressive complexity isn't about hiding things forever. It's about the right time. Frontend tooling understood this. Backend deployment largely hasn't — yet.

---

## SLIDE 25 — The standard to hold
**On slide:**
```
Does this tool remove the problem?

Or does it just make the problem
easier to deal with?
```

**Notes:** I keep coming back to this question when I look at developer tooling. Not "is this tool well-engineered" — it usually is. Not "is this better than the alternative" — maybe. But does this tool actually remove the problem, or does it just give me a better interface for dealing with it? When make automated compilation, developers stopped thinking about compilation. When npm automated dependency management, developers stopped tracking library versions. The problem disappeared. That's the bar. And I think we've lowered that bar. We've started accepting "easier to deal with" as good enough. AI is the most recent example — it makes the complexity of bad DX more tolerable. But tolerable isn't the same as gone. I came from frontend where the bar was higher. And I couldn't stop seeing it once I noticed it.

---

## SLIDE 26 — Demo intro
**On slide:**
```
What if the backend had this too?
```

**Notes:** So I decided to try something. I'd spent months thinking about this gap — between how frontend delivery felt and how backend delivery felt. Between platforms that just handle it and ecosystems that expect you to handle it yourself. And I thought: what if I applied those same three principles — detect, decide, defer — to backend deployment? What would that actually look like? I want to show you what I built. Not as a finished product, not as the definitive answer, but as proof of concept that these principles translate. That the same thinking that made frontend delivery feel lightweight can be applied to the backend too.

---

## SLIDE 27 — Demo
**On slide:**
```
[ video ]
```

**Notes:** *(play recorded video — ~90 seconds)* What you just saw: a Go project, one command, running on Cloud Run. No Dockerfile written manually, no IAM configured by hand, no registry set up, no build pipeline defined. The tool detected the stack, figured out it was Go with Gin, applied reasonable defaults, and handled the infrastructure layer. The developer's job was to write the service and run one command. That's it.

---

## SLIDE 28 — How it works
**On slide:**
```
~300 lines of Go.

Reads go.mod, package.json,
Gemfile, composer.json.

Detect → Decide → Defer.
```

**Notes:** I want to show you that this isn't magic — because I think "this isn't magic" is actually the important point. The stack detection is about 300 lines of Go. It reads whatever's in your project — go.mod tells it it's a Go project, package.json tells it Node, Gemfile tells it Ruby, composer.json tells it PHP. From that it knows the runtime, the likely entry point, what kind of container to build. The defaults — port, memory, minimum instances — are decisions I made once. Not arbitrary ones, but decisions based on what works for most services. The complexity didn't disappear. It moved — from every developer's head into one place where it can be maintained, updated, and improved. Detect, decide, defer. Same three principles.

---

## SLIDE 29 — What you can do today
**On slide:**
```
You don't need a new tool.
You need a new question.
```

**Notes:** I'm not here to tell you to use my tool or switch platforms. I want to leave you with a way of looking at your own delivery workflow that I think is more useful than any specific recommendation. Three things you can do right now, regardless of your stack or your cloud provider. First — separate "deploy for the developer" from "infrastructure for ops." These are different problems with different audiences. A developer shipping a feature shouldn't need to understand your full infrastructure topology. Second — put your deployment defaults somewhere executable. Not a wiki, not a Notion doc that's six months out of date. A script, a config file, something that runs. The decisions are made once, not rediscovered by every new person who joins. Third — audit your onboarding. What step is required that shouldn't be? What knowledge is a prerequisite on day one that could wait until day thirty?

---

## SLIDE 30 — Close
**On slide:**
```
We write software to solve problems.

What problems is your deployment
process solving?

What problems is it creating?
```

**Notes:** We started here, let's end here. I came from frontend. I didn't know how backend deployment was "supposed" to work. And that turned out to be useful — because I could see the gap clearly in a way that people who grew up with it sometimes can't. The flea had stopped dancing and everyone had gotten used to it. Two questions to take home. What in your deployment process is an entry requirement when it shouldn't be? And what problems in your stack are you solving versus just tolerating — maybe with the help of AI, maybe just out of habit? The developer you hire next month came to write logic. To build things. To solve the actual problems your product exists to solve. Give them the chance to do that on day one. The infrastructure will still be there when they're ready for it. Thank you.

---

## Timing summary

| # | Slide | Cumulative |
|---|-------|------------|
| 1 | Title | 0:00 |
| 2–4 | Philosophy | 3:30 |
| 5–6 | AI point | 6:30 |
| 7–9 | Lefty story | 10:00 |
| 10–13 | Personal story | 14:00 |
| 14–17 | Frontend principles | 18:00 |
| 18–19 | Backend reality | 20:30 |
| 20–21 | Stack comparison | 22:30 |
| 22 | Where it came from | 24:00 |
| 23–24 | Right order | 26:00 |
| 25 | The standard | 27:30 |
| 26–28 | Demo | 30:30 |
| 29 | What you can do | 32:00 |
| 30 | Close | 34:00 |
| — | Q&A buffer | ~35:00 |
