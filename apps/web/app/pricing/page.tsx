import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Check } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { createWandererCheckoutSession, createCheckoutSession } from "@/actions/paywallActions"

export default function PricingPage() {
    return (
        <div className="relative min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />
            <main className="flex-1">
                <section className="pt-32 pb-16 md:pt-48 md:pb-32">
            <div className="mx-auto max-w-6xl px-6">
                <div className="mx-auto max-w-2xl space-y-6 text-center">
                    <h1 className="text-center text-4xl font-heading tracking-tight lg:text-5xl">Pricing that Scales with You</h1>
                    <p className="font-sans text-muted-foreground">Unlock the entire library of beautifully crafted folklore and premium audio narrations. Choose the plan that fits your journey.</p>
                </div>

                <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-3">
                    {/* Wanderer (14-Day Pass) */}
                    <Card className="flex flex-col rounded-none shadow-nordic">
                        <CardHeader>
                            <CardTitle className="font-heading tracking-tight">Wanderer</CardTitle>
                            <span className="my-3 block text-3xl font-heading tracking-tight">₹99</span>
                            <CardDescription className="text-sm font-sans">The 14-Day Pass</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <hr className="border-dashed border-border-subtle" />

                            <ul className="list-outside space-y-3 text-sm font-sans">
                                {['Full library access for 14 days', 'Read every folk story', 'Premium audio narrations', 'One-time payment, no auto-renewal'].map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-2">
                                        <Check className="size-4 text-primary shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter className="mt-auto">
                            <form action={createWandererCheckoutSession} className="w-full">
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-full rounded-none">
                                    Start Journey
                                </Button>
                            </form>
                        </CardFooter>
                    </Card>

                    {/* Bard (Pro) */}
                    <Card className="relative flex flex-col rounded-none shadow-nordic border-primary/50 overflow-visible">
                        <span className="absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center bg-primary px-3 py-1 text-xs font-mono tracking-wide text-primary-foreground rounded-none shadow-nordic-sm uppercase">Popular</span>

                        <CardHeader>
                            <CardTitle className="font-heading tracking-tight">Bard</CardTitle>
                            <span className="my-3 block text-3xl font-heading tracking-tight">₹299 <span className="text-sm font-sans text-muted-foreground font-normal">/ month</span></span>
                            <CardDescription className="text-sm font-sans">The Full Experience</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <hr className="border-dashed border-border-subtle" />
                            <ul className="list-outside space-y-3 text-sm font-sans">
                                {['Unlimited access to entire library', 'Weekly new story drops', 'Premium audio narrations', 'Offline reading'].map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-2">
                                        <Check className="size-4 text-primary shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter className="mt-auto">
                            <form action={createCheckoutSession.bind(null, "", "bard")} className="w-full">
                                <Button
                                    type="submit"
                                    className="w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90">
                                    Unlock the Library
                                </Button>
                            </form>
                        </CardFooter>
                    </Card>

                    {/* Campfire (Family) */}
                    <Card className="flex flex-col rounded-none shadow-nordic">
                        <CardHeader>
                            <CardTitle className="font-heading tracking-tight">Campfire</CardTitle>
                            <span className="my-3 block text-3xl font-heading tracking-tight">₹599 <span className="text-sm font-sans text-muted-foreground font-normal">/ month</span></span>
                            <CardDescription className="text-sm font-sans">The Household</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <hr className="border-dashed border-border-subtle" />

                            <ul className="list-outside space-y-3 text-sm font-sans">
                                {['Everything in Bard', 'Up to 5 separate profiles', 'Reading streak tracking per user', 'Dedicated parental controls'].map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-2">
                                        <Check className="size-4 text-primary shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter className="mt-auto">
                            <form action={createCheckoutSession.bind(null, "", "campfire")} className="w-full">
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-full rounded-none">
                                    Upgrade for Family
                                </Button>
                            </form>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </section>
            </main>
            <Footer />
        </div>
    )
}
