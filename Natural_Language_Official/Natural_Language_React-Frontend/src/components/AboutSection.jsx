import { motion } from "framer-motion";
import image3 from '../assets/image3.jpeg'

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-5xl text-black mb-6 font-bold ">
              About{" "}
              <span style={{ color: "var(--neon-blue)" }}>Arecibo 2.0</span>
            </h2>

            
              <h1 className="text-3xl font-bold text-black mt-[60px]">
                📡 The Arecibo Message
              </h1>

              {/* Intro */}
              <ul className="list-disc list-inside space-y-2">
                <li>
                  A <span className="text-black font-bold">radio message</span> sent from the
                  Arecibo telescope to star{" "}
                  <span className="text-black font-bold">cluster M13, 25,000 light-years</span>{" "}
                  away.
                </li>
                <li>
                  A pictorial message (pictogram) made of{" "}
                  <span className="text-black font-bold">
                    1,679 binary bits
                  </span>{" "}
                  (0s and 1s).
                </li>
                <li>
                  The key is the number{" "}
                  <span className="text-black font-bold">1679=73×23</span>. Arranging
                  the bits in a{" "}
                  <span className="text-black font-bold">73×23 grid</span> reveals
                  the image.
                </li>
              </ul>

              {/* Image contents */}
              <div>
                <h2 className="font-bold text-lg text-black ">
                   The image shows:
                </h2>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li className="text-black font-semibold">Numbers 1–10</li>
                  <li className="text-black font-semibold">Key elements of life (H, C, N, O, P)</li>
                  <li className="text-black font-semibold">The DNA double helix</li>
                  <li className="text-black font-semibold">A human figure, population, and height</li>
                  <li className="text-black font-semibold">Our Solar System and the Arecibo telescope</li>
                </ul>
              </div>

              {/* Problem Statement */}
              <div>
                <h2 className="font-semibold text-lg text-bold text-black">
                   The "Problem Statement"
                </h2>

                <ol className="list-decimal list-inside space-y-3 ml-4">
                  <li>
                    <span className="font-semibold text-black">The Puzzle:</span> For
                    aliens, the message is a{" "}
                    <span className="font-semibold text-black">complex puzzle</span>. They must
                    recognize the binary code, solve the 73×23 math clue, and interpret a
                    very human-centric image.
                  </li>

                  <li>
                    <span className="font-semibold text-black">The Time Lag:</span> The
                    message will take{" "}
                    <span className="font-semibold text-black">25,000 years</span> to
                    arrive. A reply would take another 25,000 years. It is a{" "}
                    <span className="font-semibold text-black">one-way greeting</span>, not a
                    conversation.
                  </li>

                  <li>
                    <span className="font-semibold text-black">
                      The Universal Language Problem:
                    </span>{" "}
                    The message assumes aliens will understand{" "}
                    <span className="font-semibold text-black">2D images</span>, our chemistry, and our
                    biology. This is a huge assumption.
                  </li>

                  <li>
                    <span className="font-semibold text-black">
                      The Safety Debate (METI):
                    </span>{" "}
                    Is it safe to announce our existence and location to unknown cosmic
                    neighbors? This is the core of the{" "}
                    <span className="font-semibold text-black italic">
                      "Should we be shouting in the cosmos?"
                    </span>{" "}
                    debate.
                  </li>
                </ol>
              </div>
            

            

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 pt-6">
              <div className="text-center">
                <div
                  className="text-3xl mb-2"
                  style={{ color: "var(--neon-blue)" }}
                >
                  1,679
                </div>
                <div className="text-gray-600">Magic Multiple</div>
              </div>
              <div className="text-center">
                <div
                  className="text-3xl mb-2"
                  style={{ color: "var(--neon-purple)" }}
                >
                  73×23 
                </div>
                <div className="text-gray-600">Arecibo Grid</div>
              </div>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-[95px] ml-7 overflow-hidden shadow-2xl h-[800px] w-[750px]">
              <img
                src={image3}
                alt="Arecibo 2.0 Radio Telescope"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--neon-blue)]/10 to-[var(--neon-purple)]/10"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
