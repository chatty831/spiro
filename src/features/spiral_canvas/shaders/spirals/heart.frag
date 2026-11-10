precision highp float;

#define PI 3.1415926538

varying vec2 uv;

uniform vec2 iRes;
uniform float iTime;

uniform vec3 spiralColor;

uniform float spinSpeed;
uniform float throbSpeed;
uniform float throbStrength;
uniform float zoom;
uniform float thickness;
uniform float blur;
uniform float opacity;

uniform vec2 uCenter;
uniform vec2 uJelly;

float heart(vec2 uv)
{   
    float absX = abs(uv.x);
    uv.y = uv.y * 1.2 + absX * absX * 1.1 - absX * 0.66;    
    return max(0., distance(uv, vec2(0.)));
}

void main() {
    vec2 truPos = vec2(1.0, iRes.y / iRes.x) * (uv - uCenter) * 2.0;
    float centerDist = length(truPos);
    truPos += uJelly * clamp(centerDist * 0.5, 0.0, 1.0);

    float angle = atan(truPos.y, truPos.x);
    float throbFactor = .4 + sin((iTime + cos(iTime * .05) * 0.1) * throbSpeed) * 0.2 * throbStrength;
    float dist = pow(heart(truPos * .4) * 0.5, throbFactor);

    float spiFactor = sin(dist * 40. * zoom - iTime * 5. * spinSpeed) + 1.0;
    float threshold = 2.0 - thickness;
    float safeBlur = min(blur, threshold);
    spiFactor = smoothstep(threshold - safeBlur, threshold, spiFactor);
    float spiOpacity = spiFactor * opacity;

    // point-light behind the spiral: quadratic falloff, compact core + halo
    vec3 lightColor = mix(vec3(1.0), spiralColor, 0.2);
    float atten = 1.6 / (1.0 + 40.0 * centerDist * centerDist)
                + 0.5 / (1.0 + 120.0 * centerDist * centerDist);
    vec3 col = mix(lightColor, spiralColor, spiFactor);
    float alpha = max(spiOpacity, min(atten, 1.0) * opacity);

    gl_FragColor = vec4(col, alpha);
}