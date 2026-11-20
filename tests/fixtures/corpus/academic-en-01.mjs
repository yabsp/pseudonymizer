// Level statistics and tolerance runs are generated from the model rates plus a small deterministic "noise".
const noise = (i, scale) => (((i * 7919 + 17) % 101) / 100 - 0.5) * scale;
const sci = (x) => x.toExponential(2);

const CASES = [
  { label: 'A', lambda: 0.30, sigma2: 0.25, v0: 4.1e-2, beta: 1.98 },
  { label: 'B', lambda: 0.10, sigma2: 0.25, v0: 6.8e-2, beta: 1.71 },
  { label: 'C', lambda: 0.30, sigma2: 1.00, v0: 2.3e-1, beta: 1.93 },
  { label: 'D', lambda: 0.10, sigma2: 1.00, v0: 3.9e-1, beta: 1.52 },
];

const LEVEL_ROWS = CASES.flatMap((c, ci) => Array.from({ length: 8 }, (_, l) => {
  const i = ci * 8 + l;
  const h = 1 / 2 ** (l + 3);
  const variance = c.v0 * 2 ** (-c.beta * l) * (1 + noise(i, 0.12));
  const mean = (l === 0 ? 0.2175 : 0.031 * 2 ** (-1.0 * l)) * (1 + noise(i + 40, 0.08));
  const samples = Math.max(12, Math.round(1.6e5 * Math.sqrt(variance / 4 ** l) / Math.sqrt(c.v0)));
  const cost = 2.4e-3 * 4 ** l * (1 + noise(i + 80, 0.1));
  return [c.label, String(l), `1/${1 / h}`, sci(mean), sci(variance), String(samples), sci(cost)];
}));

const TOLERANCE_ROWS = Array.from({ length: 12 }, (_, k) => {
  const eps = 2e-2 / 2 ** (k / 2);
  const mc = 3.1e-1 * eps ** -3 * (1 + noise(k + 120, 0.1));
  const mlmc = 4.4e-1 * eps ** -2 * Math.log(1 / eps) ** 2 * (1 + noise(k + 160, 0.1));
  const rmse = eps * (0.71 + noise(k + 200, 0.2));
  return [sci(eps), sci(mc), sci(mlmc), (mc / mlmc).toFixed(1), sci(rmse)];
});

// 50 independent repetitions of the MLMC estimator at the three smallest tolerances (case C).
const REFERENCE_MEAN = 0.24581;
const REPETITION_ROWS = Array.from({ length: 50 }, (_, r) => [String(r + 1),
  ...[2.5e-3, 1.77e-3, 1.25e-3].flatMap((eps, j) => {
    const estimate = REFERENCE_MEAN + eps * 1.4 * noise(r * 3 + j + 300, 1);
    return [estimate.toFixed(5), (estimate - REFERENCE_MEAN).toExponential(1)];
  })]);

const table = (head, rows) => `<table class="grid">
<tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>
${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('\n')}
</table>`;

const REFERENCES = [
  ['A. Varga', 'P. Lindqvist', 'Multilevel estimators for random elliptic problems', 'J. Comput. Stoch. Anal. 14 (2021) 233-271'],
  ['R. Castellano', null, 'Sharp regularity for diffusion with lognormal coefficients', 'Numer. Math. Lett. 9 (2019) 41-77'],
  ['K. Halvorsen', 'T. Oduya', 'Circulant embedding of Matérn fields revisited', 'Rev. Appl. Probab. Comput. 31 (2022) 1102-1130'],
  ['M. Okonkwo-Hart', null, 'Finite element error estimates in Bochner spaces', 'Comput. Methods Probab. 6 (2018) 5-39'],
  ['L. Fontanella', 'D. Ritsema', 'Adaptive level selection for multilevel Monte Carlo', 'Stoch. Numer. Methods 22 (2023) 410-447'],
  ['S. Nakagawa-Brun', null, 'Karhunen-Loève truncation and its effect on quantities of interest', 'Int. J. Uncertain. Model. 12 (2020) 77-98'],
  ['F. Achterberg', 'J. Mbeki', 'Multi-index methods for groundwater flow', 'Water Resour. Comput. 41 (2024) 1-33'],
  ['C. Duvernay', null, 'Moment bounds for the inverse of lognormal random fields', 'Probab. Eng. Comput. 18 (2017) 301-319'],
  ['V. Sørlie', 'H. Amani', 'Quasi-Monte Carlo lattice rules for PDEs with random input', 'Numer. Integr. Q. 7 (2022) 140-188'],
  ['E. Marchetti', 'J. Lehmann', 'Variance reduction by coupled coarse solvers', 'Lindenberg Preprint Ser. 2025-14'],
];

const REFERENCE_VALUES = [...new Set(REFERENCES.flatMap(([a, b]) => [a, b]).filter((n) => n && n !== 'E. Marchetti' && n !== 'J. Lehmann'))]
  .map((text) => ({ text, category: 'PERSON' }));

export default {
  id: 'academic-en-01',
  domain: 'academic',
  language: 'en',
  title: 'Preprint: Sharp variance bounds for multilevel Monte Carlo with lognormal coefficients',
  header: 'PREPRINT, NOT PEER REVIEWED | MARCHETTI, OKAFOR, LEHMANN, WENGER | Sharp variance bounds for MLMC',
  footer: 'E. Marchetti et al. - preprint RIT-MATH-2026-0193 - version of 2 October 2026',
  parts: [
    {
      html: String.raw`
<p class="small">Preprint RIT-MATH-2026-0193, submitted to Computational Methods in Probability</p>
<h1>Sharp variance bounds for multilevel Monte Carlo estimators of elliptic problems with lognormal coefficients</h1>
<p class="center"><b>Elena Marchetti</b><sup>1,*</sup>, <b>Chinedu Okafor</b><sup>2</sup>, <b>Jonas Lehmann</b><sup>1</sup>, <b>Sophie Wenger</b><sup>3</sup></p>
<p class="small"><sup>1</sup> Rhône Institute of Technology, Department of Mathematics, Quai des Tanneurs 44, 1950 Sion, Switzerland<br>
<sup>2</sup> University of Aldmoor, School of Mathematical Sciences, Kestrel Road 3, Aldmoor AM2 7QX, United Kingdom<br>
<sup>3</sup> Alpenwasser Consulting AG, Hydrology Group, Gotthardstrasse 9, 6460 Altdorf, Switzerland</p>
<table class="facts small">
<tr><th>Elena Marchetti</th><td>elena.marchetti@rit.example, ORCID 0000-0002-4817-3396</td></tr>
<tr><th>Chinedu Okafor</th><td>c.okafor@aldmoor.example.ac.uk, ORCID 0000-0001-9265-0473</td></tr>
<tr><th>Jonas Lehmann</th><td>jonas.lehmann@rit.example, ORCID 0000-0003-1158-7724</td></tr>
<tr><th>Sophie Wenger</th><td>s.wenger@alpenwasser.example.ch, ORCID 0000-0002-7730-5418</td></tr>
</table>
<p class="small">* Corresponding author: Prof. Dr. Elena Marchetti, Rhône Institute of Technology, Department of
Mathematics, Office MA 3.17, Quai des Tanneurs 44, 1950 Sion, Switzerland, phone +41 27 555 18 62.</p>
<h2>Abstract</h2>
<p>We study multilevel Monte Carlo (MLMC) estimators for the expected value of a linear functional of the solution
of the elliptic diffusion problem <tex>-\nabla \cdot (a \nabla u) = f</tex> with a lognormal coefficient
<tex>a = e^{Z}</tex>, where <tex>Z</tex> is a centred Gaussian random field with Matérn covariance. Existing
analyses bound the variance of the level corrections by <tex>\mathcal{O}(h_{\ell}^{2s})</tex> with a constant that
grows exponentially in the variance <tex>\sigma^{2}</tex> of the field. We prove a sharp bound in which the
constant depends only polynomially on <tex>\sigma^{2}</tex> and on the correlation length <tex>\lambda</tex>, and we
show that the rate <tex>\beta = 2s</tex> is attained for all smoothness parameters <tex>\nu > \frac{1}{2}</tex>.
As a consequence, the computational cost to reach a root mean square error <tex>\varepsilon</tex> is
<tex>\mathcal{O}(\varepsilon^{-2} (\log \varepsilon)^{2})</tex> in two space dimensions, uniformly in the
regime relevant to groundwater flow. Numerical experiments with up to eight levels and four parameter sets
confirm the predicted rates and show savings of two orders of magnitude over standard Monte Carlo.</p>
<p><b>Keywords:</b> multilevel Monte Carlo, lognormal diffusion, Matérn covariance, finite element method,
uncertainty quantification, complexity analysis</p>
<p><b>MSC 2020:</b> 65C05, 65N30, 60H35, 35R60</p>
<p><b>Funding:</b> This work was supported by the Swiss National Science Foundation under grant no. 200021_228417
and by EPSRC grant EP/X031745/1.</p>
`,
    },
    {
      columns: 2,
      html: String.raw`
<h2>1 Introduction</h2>
<p>Partial differential equations with random coefficients are a standard model for subsurface flow when the
permeability of the rock is known only through a few measurements. The most widely used model takes the
logarithm of the permeability as a Gaussian random field, which guarantees positivity and reproduces the heavy
tails observed in field data. Quantities of interest, such as the flux through a part of the boundary or the
average pressure in a well, are then random variables whose moments must be computed numerically.</p>
<p>Standard Monte Carlo sampling converges at the rate <tex>N^{-1/2}</tex> independently of the dimension of the
stochastic input, but every sample requires the solution of a finite element problem on a fine mesh. Multilevel
Monte Carlo, introduced for stochastic differential equations and later extended to elliptic problems by Varga
and Lindqvist [1], reduces the cost by combining many cheap samples on coarse meshes with few expensive samples on
fine meshes. Its efficiency hinges on the decay of the variance of the corrections between consecutive levels.</p>
<p>For lognormal coefficients the coefficient is neither uniformly bounded from above nor uniformly bounded away
from zero. Castellano [2] obtained pathwise regularity in Hölder spaces, and Duvernay [8] proved that all
negative moments of the minimum of <tex>a</tex> are finite. Combined, these results yield variance bounds whose
constants grow like <tex>e^{c \sigma^{2}}</tex>, which is far too pessimistic for the variances
<tex>\sigma^{2} \in [0.25, 1]</tex> used in practice. Fontanella and Ritsema [5] observed numerically that the
actual decay is much better and proposed an adaptive level selection, but without a proof.</p>
<p>Our contributions are threefold. First, we prove a variance bound for the level corrections with a constant that
is polynomial in <tex>\sigma^{2}</tex> and <tex>\lambda^{-1}</tex>. Second, we show that the bound is sharp in the
sense that the exponent cannot be improved for any Matérn smoothness. Third, we confirm the theory with
experiments on a model problem from regional groundwater management that was provided by our industrial partner.
The approach is complementary to quasi-Monte Carlo methods [9] and to multi-index methods [7].</p>
<p>The paper is organised as follows. Section 2 introduces the model problem and the assumptions on the random
field. Section 3 recalls the MLMC estimator and states the main theorem. Section 4 reports numerical experiments,
and Section 5 discusses limitations. The proofs are collected in Appendix A, the detailed level statistics in
Appendix B.</p>
<h2>2 Problem setting</h2>
<p>Let <tex>D \subset \mathbb{R}^{2}</tex> be a bounded convex polygon and let
<tex>(\Omega, \mathcal{F}, \mathbb{P})</tex> be a probability space. For almost every
<tex>\omega \in \Omega</tex> we seek <tex>u(\cdot, \omega) \in H^{1}_{0}(D)</tex> such that</p>
<tex display>-\nabla \cdot \left(a(x, \omega) \nabla u(x, \omega)\right) = f(x), \quad x \in D</tex>
<p>with homogeneous Dirichlet conditions on <tex>\partial D</tex>. The coefficient is
<tex>a(x, \omega) = \exp\left(Z(x, \omega)\right)</tex>, where <tex>Z</tex> is a centred Gaussian field with the
Matérn covariance function</p>
<tex display>C_{\nu}(r) = \sigma^{2} \frac{2^{1-\nu}}{\Gamma(\nu)} \left(\sqrt{2\nu} \frac{r}{\lambda}\right)^{\nu} K_{\nu}\left(\sqrt{2\nu} \frac{r}{\lambda}\right)</tex>
<p>Here <tex>K_{\nu}</tex> is the modified Bessel function of the second kind, <tex>\lambda > 0</tex> the
correlation length and <tex>\nu > 0</tex> the smoothness. For <tex>\nu = \frac{1}{2}</tex> the covariance
reduces to the exponential kernel,</p>
<tex display>C_{1/2}(r) = \sigma^{2} \exp\left(-\frac{r}{\lambda}\right)</tex>
<p>The field admits the Karhunen-Loève expansion</p>
<tex display>Z(x, \omega) = \sum_{k=1}^{\infty} \sqrt{\mu_{k}}\, \phi_{k}(x)\, \xi_{k}(\omega), \qquad \xi_{k} \sim \mathcal{N}(0, 1)\ \mathrm{i.i.d.}</tex>
<p>where <tex>(\mu_{k}, \phi_{k})</tex> are the eigenpairs of the covariance operator. We do not truncate the
expansion; samples are drawn exactly on the mesh nodes by circulant embedding [3].</p>
<p><b>Assumption 1.</b> The right-hand side satisfies <tex>f \in L^{2}(D)</tex>, and the quantity of interest is
a bounded linear functional <tex>G \in H^{-1}(D)</tex>, for example the average over a subdomain,</p>
<tex display>Q(\omega) = G\left(u(\cdot, \omega)\right) = \frac{1}{|D^{*}|} \int_{D^{*}} u(x, \omega)\, dx</tex>
<p>Define the pathwise bounds <tex>a_{\min}(\omega) = \min_{x \in \bar{D}} a(x, \omega)</tex> and
<tex>a_{\max}(\omega) = \max_{x \in \bar{D}} a(x, \omega)</tex>. By Fernique's theorem both have finite moments
of all orders, and the Lax-Milgram lemma gives the pathwise stability estimate</p>
<tex display>\|u(\cdot, \omega)\|_{H^{1}_{0}(D)} \leq \frac{\|f\|_{H^{-1}(D)}}{a_{\min}(\omega)}</tex>
<p>The regularity of <tex>u</tex> depends on the smoothness of <tex>a</tex>. With
<tex>s = \min(\nu, 1)</tex> the realisations of <tex>a</tex> are Hölder continuous with exponent
<tex>t < s</tex>, and the solution satisfies <tex>u(\cdot, \omega) \in H^{1+t}(D)</tex>.</p>
`,
    },
    {
      columns: 2,
      html: String.raw`
<h2>3 Multilevel Monte Carlo and main result</h2>
<p>Let <tex>\mathcal{T}_{0}, \mathcal{T}_{1}, \ldots, \mathcal{T}_{L}</tex> be a sequence of uniformly refined
triangulations with mesh sizes <tex>h_{\ell} = h_{0} 2^{-\ell}</tex>, and let <tex>u_{\ell}</tex> be the
piecewise linear finite element approximation on <tex>\mathcal{T}_{\ell}</tex>. With
<tex>Q_{\ell} = G(u_{\ell})</tex> the telescoping sum reads</p>
<tex display>\mathbb{E}[Q_{L}] = \mathbb{E}[Q_{0}] + \sum_{\ell=1}^{L} \mathbb{E}[Q_{\ell} - Q_{\ell-1}]</tex>
<p>Each term is estimated independently with <tex>N_{\ell}</tex> samples, where both <tex>Q_{\ell}</tex> and
<tex>Q_{\ell-1}</tex> in a correction use the same realisation of the field:</p>
<tex display>\widehat{Q}^{\mathrm{ML}} = \sum_{\ell=0}^{L} \frac{1}{N_{\ell}} \sum_{i=1}^{N_{\ell}} Y_{\ell}^{(i)}, \qquad Y_{\ell} = Q_{\ell} - Q_{\ell-1},\ Q_{-1} = 0</tex>
<p>The mean square error splits into a bias and a sampling term,</p>
<tex display>\mathbb{E}\left[\left(\widehat{Q}^{\mathrm{ML}} - \mathbb{E}[Q]\right)^{2}\right] = \left(\mathbb{E}[Q_{L} - Q]\right)^{2} + \sum_{\ell=0}^{L} \frac{V_{\ell}}{N_{\ell}}</tex>
<p>where <tex>V_{\ell} = \mathrm{Var}[Y_{\ell}]</tex>. Minimising the cost
<tex>\sum_{\ell} N_{\ell} C_{\ell}</tex> for a sampling error of <tex>\frac{\varepsilon^{2}}{2}</tex> with a
Lagrange multiplier yields the well-known optimal sample sizes</p>
<tex display>N_{\ell} = \left\lceil 2 \varepsilon^{-2} \sqrt{\frac{V_{\ell}}{C_{\ell}}} \sum_{k=0}^{L} \sqrt{V_{k} C_{k}} \right\rceil</tex>
<p>The complexity of MLMC follows from three rates: the weak error
<tex>|\mathbb{E}[Q_{\ell} - Q]| \leq c_{1} h_{\ell}^{\alpha}</tex>, the variance
<tex>V_{\ell} \leq c_{2} h_{\ell}^{\beta}</tex> and the cost <tex>C_{\ell} \leq c_{3} h_{\ell}^{-\gamma}</tex>.
If <tex>\alpha \geq \frac{1}{2} \min(\beta, \gamma)</tex>, the total cost to reach a root mean square error
<tex>\varepsilon</tex> satisfies</p>
<tex display>\mathcal{C}(\varepsilon) \leq c_{4} \begin{cases} \varepsilon^{-2} & \beta > \gamma \\ \varepsilon^{-2} (\log \varepsilon)^{2} & \beta = \gamma \\ \varepsilon^{-2 - (\gamma - \beta)/\alpha} & \beta < \gamma \end{cases}</tex>
<p>For piecewise linear elements in two dimensions with an optimal multigrid solver, <tex>\gamma = 2</tex>. The
critical question is therefore whether <tex>\beta = 2</tex> holds, and with which constant.</p>
<p><b>Theorem 1 (variance of the level corrections).</b> Let Assumption 1 hold and let
<tex>\nu > \frac{1}{2}</tex>. Then for every <tex>t < s</tex> there is a constant <tex>c_{t}</tex>, independent of
<tex>\ell</tex>, <tex>\sigma^{2}</tex> and <tex>\lambda</tex>, such that</p>
<tex display>V_{\ell} \leq c_{t} \left(1 + \sigma^{2}\right)^{4} \left(1 + \lambda^{-1}\right)^{2t} h_{\ell}^{2t}</tex>
<p>The proof, given in Appendix A, avoids the crude estimate
<tex>\mathbb{E}[a_{\min}^{-p}] \leq e^{p^{2} \sigma^{2}/2}</tex> by working with a weighted energy norm in which the
coefficient appears inside the norm rather than as a factor in front of it. The key step is a duality argument
of Aubin-Nitsche type for the functional <tex>G</tex>,</p>
<tex display>|G(u - u_{\ell})| \leq \|a^{1/2} \nabla(u - u_{\ell})\|_{L^{2}(D)}\, \|a^{1/2} \nabla(z - z_{\ell})\|_{L^{2}(D)}</tex>
<p>where <tex>z</tex> is the solution of the adjoint problem with right-hand side <tex>G</tex>. Together with the
Céa lemma in the energy norm,</p>
<tex display>\|a^{1/2} \nabla(u - u_{\ell})\|_{L^{2}(D)} = \min_{v_{\ell} \in V_{\ell}^{h}} \|a^{1/2} \nabla(u - v_{\ell})\|_{L^{2}(D)}</tex>
<p>and a pathwise interpolation estimate, the moments of the product can be bounded with Hölder's inequality
using only polynomial moments of <tex>\|Z\|_{C^{t}(\bar{D})}</tex>.</p>
<p><b>Corollary 2.</b> Under the assumptions of Theorem 1 with <tex>\nu \geq 1</tex>, MLMC reaches a root mean
square error <tex>\varepsilon</tex> at cost <tex>\mathcal{O}(\varepsilon^{-2} (\log \varepsilon)^{2})</tex>,
with a constant that grows at most like <tex>(1 + \sigma^{2})^{4}</tex>.</p>
<p><b>Proposition 3 (sharpness).</b> For the exponential covariance on the unit square and
<tex>G</tex> the average over <tex>D^{*} = (0.25, 0.75)^{2}</tex>, there is <tex>c > 0</tex> with
<tex>V_{\ell} \geq c\, h_{\ell}^{1}</tex> for all <tex>\ell</tex>, so the rate <tex>\beta = 2s</tex> cannot be
improved.</p>
`,
    },
    {
      columns: 2,
      html: String.raw`
<h2>4 Numerical experiments</h2>
<p>All experiments use the unit square <tex>D = (0, 1)^{2}</tex>, the right-hand side <tex>f \equiv 1</tex> and
the quantity of interest of Assumption 1 with <tex>D^{*} = (0.25, 0.75)^{2}</tex>. The coarsest mesh has
<tex>h_{0} = \frac{1}{8}</tex>, and up to eight levels are used, so that the finest mesh has 1 048 576 elements.
On each element the local stiffness matrix of the reference triangle with constant coefficient is</p>
<tex display>K^{\mathrm{ref}} = \frac{a_{T}}{2} \begin{pmatrix} 2 & -1 & -1 \\ -1 & 1 & 0 \\ -1 & 0 & 1 \end{pmatrix}</tex>
<p>where <tex>a_{T}</tex> is the value of the coefficient at the centroid of the element. The linear systems are
solved with algebraic multigrid to a relative residual of <tex>10^{-10}</tex>.</p>
<p>We consider four parameter sets, combining the correlation lengths <tex>\lambda \in \{0.1, 0.3\}</tex>
with the variances <tex>\sigma^{2} \in \{0.25, 1\}</tex>, all with the exponential covariance:</p>
<table class="grid">
<tr><th>Case</th><th>λ</th><th>σ²</th><th>Fitted β</th></tr>
${CASES.map((c) => `<tr><td>${c.label}</td><td>${c.lambda.toFixed(2)}</td><td>${c.sigma2.toFixed(2)}</td><td>${c.beta.toFixed(2)}</td></tr>`).join('\n')}
</table>
<p>The fitted rates are obtained by least squares on levels 2 to 7,</p>
<tex display>\hat{\beta} = -\frac{\sum_{\ell} (\ell - \bar{\ell})(\log_{2} V_{\ell} - \overline{\log_{2} V})}{\sum_{\ell} (\ell - \bar{\ell})^{2}}</tex>
<p>For the long correlation length (cases A and C) the observed rate is close to 2, in line with the smooth
behaviour of the realisations at the scale of the coarse meshes. For <tex>\lambda = 0.1</tex> the pre-asymptotic
regime extends over the first three levels, and the fitted rate is lower. Importantly, the ratio of the variance
constants between <tex>\sigma^{2} = 1</tex> and <tex>\sigma^{2} = 0.25</tex> is about 5.7, far below the factor
<tex>e^{3} \approx 20</tex> predicted by the previous exponential bounds and consistent with the polynomial
factor of Theorem 1.</p>
<p>The cost comparison in the table below uses case C. Standard Monte Carlo is run on the level required for the
bias, with <tex>N = 2 \varepsilon^{-2} \mathrm{Var}[Q_{L}]</tex> samples.</p>
${table(['ε', 'MC cost (s)', 'MLMC cost (s)', 'Ratio', 'RMSE'], TOLERANCE_ROWS.slice(0, 8))}
<p>The cost of MLMC grows like <tex>\varepsilon^{-2} (\log \varepsilon)^{2}</tex>, while standard Monte Carlo
grows like <tex>\varepsilon^{-3}</tex>. At the smallest tolerance the saving exceeds a factor of 100. The observed
root mean square error, computed from 50 independent repetitions, stays below the prescribed tolerance in all
runs.</p>
<p>Runs were performed on 64 nodes of the cluster of our institute; one sample on the finest level takes about
0.31 s with 16 cores. The full level statistics are listed in Appendix B.</p>
<h2>5 Discussion</h2>
<p>The main limitation of our analysis is the assumption of a convex polygonal domain. For non-convex domains the
solution has corner singularities, and the variance rate is limited by the reentrant corner rather than by the
coefficient; this case is covered by graded meshes but the constants are not yet explicit. A second limitation
is the restriction to linear functionals. Nonlinear quantities, such as the probability that the pressure
exceeds a threshold, require smoothing and lead to a different variance decay.</p>
<p>From a practical point of view, the polynomial constant justifies the use of MLMC for the high variances that
occur in alpine aquifers with strongly heterogeneous gravel layers. Together with the adaptive level selection of
Fontanella and Ritsema [5], our bound allows the number of levels to be chosen a priori from the data of the
covariance model alone.</p>
<h2>6 Conclusion</h2>
<p>We proved a sharp variance bound for MLMC corrections with lognormal coefficients whose constant is polynomial
in the field variance and the inverse correlation length. The theory explains the good performance observed in
practice and predicts the complexity <tex>\mathcal{O}(\varepsilon^{-2} (\log \varepsilon)^{2})</tex> in two
dimensions. Extensions to multi-index estimators [7] and to quasi-Monte Carlo sampling on each level [9] are the
subject of ongoing work.</p>
<h2>Acknowledgements</h2>
<p>We thank Dr. Thomas Imhof for many discussions on circulant embedding and Andrea Kälin for help with the
groundwater model. Computations were performed on the cluster hpc-login02.rit.example; we acknowledge the support
of the scientific computing team (ticket HPC-48817).</p>
<h2>Data availability</h2>
<p>The code and the raw level statistics are available at https://git.rit.example/emarchetti/mlmc-lognormal
(tag v1.2.0). The groundwater model of the Reuss valley was provided by Alpenwasser Consulting AG under
data-sharing agreement DSA-2025-117 and cannot be published.</p>
<h2>References</h2>
<ol class="small">
${REFERENCES.map(([a, b, t, j]) => `<li>${a}${b ? `, ${b}` : ''}, ${t}, ${j}.</li>`).join('\n')}
</ol>
`,
    },
    {
      html: String.raw`
<h2>Appendix A: Proofs</h2>
<p><b>Lemma A.1 (moments of the Hölder norm).</b> For every <tex>t < s</tex> and <tex>p \geq 1</tex> there is a
constant <tex>c_{p,t}</tex>, independent of <tex>\sigma^{2}</tex> and <tex>\lambda</tex>, such that</p>
<tex display>\mathbb{E}\left[\|Z\|_{C^{t}(\bar{D})}^{p}\right]^{1/p} \leq c_{p,t}\, \sigma \left(1 + \lambda^{-1}\right)^{t}</tex>
<p><i>Proof.</i> By Kolmogorov's continuity theorem applied to the increments of <tex>Z</tex>, it suffices to
bound the second moment of the increments. For the Matérn covariance one has, for <tex>r = \|x - y\|</tex>,</p>
<tex display>\mathbb{E}\left[|Z(x) - Z(y)|^{2}\right] = 2 \left(C_{\nu}(0) - C_{\nu}(r)\right) \leq c_{\nu}\, \sigma^{2} \left(\frac{r}{\lambda}\right)^{2s}</tex>
<p>Since increments of a Gaussian field are Gaussian, all higher moments follow from the second one, and the
claim follows from the Garsia-Rodemich-Rumsey inequality. <tex>\square</tex></p>
<p><b>Lemma A.2 (weighted interpolation).</b> Let <tex>I_{\ell}</tex> be the nodal interpolant on
<tex>\mathcal{T}_{\ell}</tex>. Then pathwise</p>
<tex display>\|a^{1/2} \nabla(u - I_{\ell} u)\|_{L^{2}(D)} \leq c\, a_{\max}^{1/2}\, h_{\ell}^{t}\, |u|_{H^{1+t}(D)}</tex>
<p>and the regularity estimate of Castellano [2] gives</p>
<tex display>|u|_{H^{1+t}(D)} \leq c \frac{a_{\max}}{a_{\min}^{2}} \|a\|_{C^{t}(\bar{D})} \|f\|_{L^{2}(D)}</tex>
<p><b>Proof of Theorem 1.</b> Write <tex>Y_{\ell} = (Q_{\ell} - Q) - (Q_{\ell-1} - Q)</tex>, so that
<tex>V_{\ell} \leq 2\, \mathbb{E}[(Q_{\ell} - Q)^{2}] + 2\, \mathbb{E}[(Q_{\ell-1} - Q)^{2}]</tex>. By the duality
estimate of Section 3, the Céa lemma and Lemma A.2,</p>
<tex display>|Q - Q_{\ell}| \leq c\, h_{\ell}^{2t}\, \frac{a_{\max}^{3}}{a_{\min}^{4}}\, \|a\|_{C^{t}(\bar{D})}^{2}\, \|f\|_{L^{2}(D)}\, \|G\|_{L^{2}(D)}</tex>
<p>The decisive observation is that <tex>a_{\max}/a_{\min} \leq \exp\left(2 \|Z\|_{C^{0}}\right)</tex> only enters
through the ratio, which is invariant under adding a constant to <tex>Z</tex>. Writing
<tex>Z = \bar{Z} + \tilde{Z}</tex> with the spatial mean <tex>\bar{Z}</tex>, the factor
<tex>e^{\bar{Z}}</tex> cancels between numerator and denominator, and <tex>\tilde{Z}</tex> satisfies</p>
<tex display>\|\tilde{Z}\|_{C^{0}(\bar{D})} \leq \mathrm{diam}(D)^{t}\, |Z|_{C^{t}(\bar{D})}</tex>
<p>For the remaining exponential of the oscillation we use the bound <tex>e^{x} \leq \sum_{k=0}^{8} \frac{x^{k}}{k!} + \frac{x^{9}}{9!} e^{x}</tex>
together with Lemma A.1 and Hölder's inequality, which gives the polynomial dependence on
<tex>\sigma^{2}</tex>. Squaring, taking expectations and collecting terms,</p>
<tex display>\mathbb{E}\left[(Q - Q_{\ell})^{2}\right] \leq c_{t} \left(1 + \sigma^{2}\right)^{4} \left(1 + \lambda^{-1}\right)^{2t} h_{\ell}^{4t}</tex>
<p>which is stronger than the claimed bound for the variance of a single level; the bound for <tex>V_{\ell}</tex>
follows with <tex>h_{\ell-1} = 2 h_{\ell}</tex>. <tex>\square</tex></p>
<p><b>Proof of Proposition 3.</b> For the exponential covariance the realisations are almost surely not in
<tex>C^{1/2}</tex>. Let <tex>\theta</tex> be a smooth cut-off with support in <tex>D^{*}</tex>. A direct
computation in the Fourier domain gives</p>
<tex display>\lim_{\ell \to \infty} h_{\ell}^{-1}\, \mathbb{E}\left[(Q_{\ell} - Q_{\ell-1})^{2}\right] = c_{\theta}\, \sigma^{2} \lambda^{-1} \int_{\mathbb{R}^{2}} \frac{|\hat{\theta}(\xi)|^{2}}{(1 + |\xi|^{2})^{3/2}}\, d\xi > 0</tex>
<p>which shows the lower bound. <tex>\square</tex></p>
<div class="page-break"></div>
<h2>Appendix B: Level statistics</h2>
<p>The table lists, for every case and level, the mesh size, the estimated mean and variance of the correction
<tex>Y_{\ell}</tex>, the number of samples used at the smallest tolerance and the average cost per sample in
seconds on 16 cores.</p>
${table(['Case', 'ℓ', 'h', 'Mean Y', 'Var Y', 'N', 'Cost (s)'], LEVEL_ROWS)}
<h3>B.2 All tolerance runs (case C)</h3>
${table(['ε', 'MC cost (s)', 'MLMC cost (s)', 'Ratio', 'RMSE'], TOLERANCE_ROWS)}
<p>Standard Monte Carlo was extrapolated from the cost per sample for the four smallest tolerances, since a direct
run would have exceeded the allocation of project RIT-HPC-2026-031.</p>
<div class="page-break"></div>
<h2>Appendix C: Repetitions</h2>
<p>Estimates and errors of 50 independent repetitions of the MLMC estimator for case C, relative to a reference
value <tex>\mathbb{E}[Q] \approx 0.24581</tex> computed with <tex>\varepsilon = 2 \cdot 10^{-4}</tex>. The empirical
root mean square error is <tex>\sqrt{\frac{1}{50} \sum_{r=1}^{50} \left(\widehat{Q}_{r} - \mathbb{E}[Q]\right)^{2}}</tex>.</p>
${table(['Run', 'Estimate (ε = 2.5e-3)', 'Error', 'Estimate (ε = 1.77e-3)', 'Error', 'Estimate (ε = 1.25e-3)', 'Error'], REPETITION_ROWS)}
<div class="as-image">Rhône Institute of Technology - Preprint Series - RIT-MATH-2026-0193 - received 02.10.2026 - contact: E. Marchetti</div>
`,
    },
  ],
  values: [
    { text: 'MARCHETTI', category: 'PERSON' },
    { text: 'OKAFOR', category: 'PERSON' },
    { text: 'LEHMANN', category: 'PERSON' },
    { text: 'WENGER', category: 'PERSON' },
    { text: 'E. Marchetti', category: 'PERSON' },
    { text: 'J. Lehmann', category: 'PERSON' },
    { text: 'Elena Marchetti', category: 'PERSON' },
    { text: 'Chinedu Okafor', category: 'PERSON' },
    { text: 'Jonas Lehmann', category: 'PERSON' },
    { text: 'Sophie Wenger', category: 'PERSON' },
    { text: 'elena.marchetti@rit.example', category: 'EMAIL' },
    { text: 'c.okafor@aldmoor.example.ac.uk', category: 'EMAIL' },
    { text: 'jonas.lehmann@rit.example', category: 'EMAIL' },
    { text: 's.wenger@alpenwasser.example.ch', category: 'EMAIL' },
    { text: '0000-0002-4817-3396', category: 'ID' },
    { text: '0000-0001-9265-0473', category: 'ID' },
    { text: '0000-0003-1158-7724', category: 'ID' },
    { text: '0000-0002-7730-5418', category: 'ID' },
    { text: 'Rhône Institute of Technology', category: 'COMPANY' },
    { text: 'University of Aldmoor', category: 'COMPANY' },
    { text: 'Alpenwasser Consulting AG', category: 'COMPANY' },
    { text: 'Quai des Tanneurs 44', category: 'ADDRESS' },
    { text: '1950 Sion', category: 'ADDRESS' },
    { text: 'Kestrel Road 3', category: 'ADDRESS' },
    { text: 'Aldmoor AM2 7QX', category: 'ADDRESS' },
    { text: 'Gotthardstrasse 9', category: 'ADDRESS' },
    { text: '6460 Altdorf', category: 'ADDRESS' },
    { text: 'Office MA 3.17', category: 'ADDRESS' },
    { text: '+41 27 555 18 62', category: 'PHONE' },
    { text: '200021_228417', category: 'ID' },
    { text: 'EP/X031745/1', category: 'ID' },
    { text: 'RIT-MATH-2026-0193', category: 'ID' },
    { text: 'Thomas Imhof', category: 'PERSON' },
    { text: 'Andrea Kälin', category: 'PERSON' },
    { text: 'hpc-login02.rit.example', category: 'HOST' },
    { text: 'HPC-48817', category: 'ID' },
    { text: 'https://git.rit.example/emarchetti/mlmc-lognormal', category: 'URL' },
    { text: 'emarchetti', category: 'USERNAME' },
    { text: 'DSA-2025-117', category: 'ID' },
    { text: 'RIT-HPC-2026-031', category: 'ID' },
    ...REFERENCE_VALUES,
  ],
  keep: ['multilevel Monte Carlo', 'Matérn covariance', 'Karhunen-Loève expansion', 'circulant embedding',
    'Lax-Milgram lemma', 'Aubin-Nitsche', 'Céa lemma', 'algebraic multigrid', 'Garsia-Rodemich-Rumsey inequality',
    'MSC 2020'],
};
