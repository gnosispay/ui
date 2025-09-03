import * as React from "react";
import type { CardInfo } from "./card-back-with-background";

interface CardBackProps extends React.SVGProps<SVGSVGElement> {
  cardholderName?: string | null;
  cardInfo?: CardInfo;
}

const chunkPan = (pan: string) => {
  return pan.match(/.{1,4}/g) || ["0000", "0000", "0000", "0000"];
};

const CardBack: React.FC<CardBackProps> = ({
  cardholderName = "SAXIFRAGE RUSSELL",
  cardInfo,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    fill="none"
    viewBox="0 0 160 253"
    {...props}
  >
    <style>{'.mono{font-family:"Source Code Pro",monospace}'}</style>
    <g clipPath="url(#clip0_600_796)">
      <rect
        width={159.296}
        height={253}
        fill="url(#paint0_linear_600_796)"
        rx={7}
      />
      <g opacity={0.4}>
        <path
          fill="url(#paint1_linear_600_796)"
          d="M117.746 237.521c2.616 0 5.167-.9 7.229-2.548l-16.584-17.132c-3.997 5.337-3.04 13.025 2.127 17.154 2.083 1.626 4.613 2.526 7.228 2.526Z"
        />
        <path
          fill="url(#paint2_linear_600_796)"
          d="M167.074 225.286a12.49 12.49 0 0 0-2.467-7.468l-16.584 17.132c5.167 4.129 12.587 3.141 16.584-2.196a12.494 12.494 0 0 0 2.467-7.468Z"
        />
        <path
          fill="url(#paint3_linear_600_796)"
          d="m175.43 206.638-7.335 7.577c5.91 7.314 4.975 18.209-2.105 24.315-6.209 5.359-15.224 5.359-21.432 0l-8.058 8.324-8.037-8.302c-7.08 6.106-17.626 5.14-23.537-2.175-5.188-6.413-5.188-15.726 0-22.14l-3.763-3.887-3.572-3.712C93.275 213.974 91 222.408 91 230.996 91 256.958 111.369 278 136.5 278s45.5-21.042 45.5-47.004a48.06 48.06 0 0 0-6.57-24.358Z"
        />
        <path
          fill="url(#paint4_linear_600_796)"
          d="M169.413 198.559c-17.328-18.779-46.116-19.482-64.295-1.581a53.51 53.51 0 0 0-1.531 1.581 49.309 49.309 0 0 0-3.189 3.844l36.102 37.318 36.103-37.318c-.978-1.34-2.063-2.614-3.19-3.844Zm-32.913-8.412c10.631 0 20.539 4.239 27.981 11.971L136.5 231.023l-27.98-28.905c7.442-7.732 17.349-11.971 27.98-11.971Z"
        />
      </g>
      <path fill="#000" d="M12 0h38v253H12z" />
      <text
        xmlSpace="preserve"
        fill="#8D9846"
        className="mono"
        fontSize={14}
        fontWeight={500}
        letterSpacing=".12em"
        style={{
          whiteSpace: "pre",
        }}
      >
        <tspan x={107} y={68.491}>
          {cardInfo ? chunkPan(cardInfo.pan)[0] : "0000"}
        </tspan>
      </text>
      <text
        xmlSpace="preserve"
        fill="#8D9846"
        className="mono"
        fontSize={14}
        fontWeight={500}
        letterSpacing=".12em"
        style={{
          whiteSpace: "pre",
        }}
      >
        <tspan x={107} y={87.491}>
          {cardInfo ? chunkPan(cardInfo.pan)[1] : "0000"}
        </tspan>
      </text>
      <text
        xmlSpace="preserve"
        fill="#8D9846"
        className="mono"
        fontSize={14}
        fontWeight={500}
        letterSpacing=".12em"
        style={{
          whiteSpace: "pre",
        }}
      >
        <tspan x={107} y={107.491}>
          {cardInfo ? chunkPan(cardInfo.pan)[2] : "0000"}
        </tspan>
      </text>
      <text
        xmlSpace="preserve"
        fill="#8D9846"
        className="mono"
        fontSize={14}
        fontWeight={500}
        letterSpacing=".12em"
        style={{
          whiteSpace: "pre",
        }}
      >
        <tspan x={107} y={127.491}>
          {cardInfo ? chunkPan(cardInfo.pan)[3] : "0000"}
        </tspan>
      </text>
      <text
        xmlSpace="preserve"
        fill="#8D9846"
        className="mono"
        fontSize={7}
        letterSpacing=".06em"
        style={{
          whiteSpace: "pre",
        }}
      >
        <tspan x={124} y={138.996}>
          {cardInfo ? cardInfo.expiry : "00/00"}
        </tspan>
      </text>
      <text
        xmlSpace="preserve"
        fill="#8D9846"
        className="mono"
        fontSize={7}
        letterSpacing=".06em"
        style={{
          whiteSpace: "pre",
        }}
      >
        <tspan x={133} y={150.996}>
          {cardInfo ? cardInfo.cvv : "000"}
        </tspan>
      </text>
      <text
        xmlSpace="preserve"
        fill="#8D9846"
        className="mono"
        fontSize={4}
        letterSpacing=".06em"
        style={{
          whiteSpace: "pre",
        }}
      >
        <tspan x={102} y={136.676}>
          {"EXP.\n"}
        </tspan>
        <tspan x={102} y={141.176}>
          {"DATE"}
        </tspan>
      </text>
      <text
        xmlSpace="preserve"
        fill="#8D9846"
        className="mono"
        fontSize={4}
        letterSpacing=".06em"
        style={{
          whiteSpace: "pre",
        }}
      >
        <tspan x={102} y={146.676}>
          {"SECURITY\n"}
        </tspan>
        <tspan x={102} y={151.176}>
          {"CODE"}
        </tspan>
      </text>
      <path
        stroke="#fff"
        strokeWidth={0.5}
        d="M150 57.5V70l-47 5v13m47-11v12.5l-47 5v13m47-11V109l-47 5v13"
      />
      <text
        xmlSpace="preserve"
        fill="#919C4A"
        className="mono"
        fontSize={8}
        fontWeight={500}
        letterSpacing="0em"
        style={{
          whiteSpace: "pre",
        }}
      >
        <tspan id="gp-name" x={150.453} y={168.844} textAnchor="end">
          {cardholderName}
        </tspan>
      </text>
      <text
        xmlSpace="preserve"
        fill="#919C4A"
        className="mono"
        fontSize={4}
        fontWeight={500}
        letterSpacing="0em"
        style={{
          whiteSpace: "pre",
        }}
      >
        <tspan x={118.82} y={174.922}>
          <a>{"gnosispay.com"}</a>
        </tspan>
      </text>
      <path fill="url(#pattern0)" d="M119 12h26v34h-26z" />
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_600_796"
        x1={79.648}
        x2={79.648}
        y1={0}
        y2={253}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#353532" />
        <stop offset={1} />
      </linearGradient>
      <linearGradient
        id="paint1_linear_600_796"
        x1={136.5}
        x2={136.071}
        y1={184}
        y2={245.527}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FBFBFB" stopOpacity={0.4} />
        <stop offset={1} stopColor="#828282" stopOpacity={0.5} />
        <stop offset={1} stopColor="#828282" stopOpacity={0.7} />
      </linearGradient>
      <linearGradient
        id="paint2_linear_600_796"
        x1={136.5}
        x2={136.071}
        y1={184}
        y2={245.527}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FBFBFB" stopOpacity={0.4} />
        <stop offset={1} stopColor="#828282" stopOpacity={0.5} />
        <stop offset={1} stopColor="#828282" stopOpacity={0.7} />
      </linearGradient>
      <linearGradient
        id="paint3_linear_600_796"
        x1={136.5}
        x2={136.071}
        y1={184}
        y2={245.527}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FBFBFB" stopOpacity={0.4} />
        <stop offset={1} stopColor="#828282" stopOpacity={0.5} />
        <stop offset={1} stopColor="#828282" stopOpacity={0.7} />
      </linearGradient>
      <linearGradient
        id="paint4_linear_600_796"
        x1={136.5}
        x2={136.071}
        y1={184}
        y2={245.527}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FBFBFB" stopOpacity={0.4} />
        <stop offset={1} stopColor="#828282" stopOpacity={0.5} />
        <stop offset={1} stopColor="#828282" stopOpacity={0.7} />
      </linearGradient>
      <clipPath id="clip0_600_796">
        <rect width={159.296} height={253} fill="#fff" rx={7} />
      </clipPath>
      <pattern
        id="pattern0"
        width={1}
        height={1}
        patternContentUnits="objectBoundingBox"
      >
        <use
          xlinkHref="#image0_600_796"
          transform="matrix(.0132 0 0 .0101 -.002 0)"
        />
      </pattern>
      <image
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEwAAABjCAYAAAAxbebIAAAACXBIWXMAACE3AAAhNwEzWJ96AAAgAElEQVR4nOW8WZOd15Wm9+zhm8+YM5IgkRRlihooQFWlVneXbKSife2CfwGzfkHxHwj9C4rVN46w3SEyoh1R0Y6wIEfY4WoPBbbd7upyqQyqJJHimCAx5njmb9iTL74DkBQpDiLAob1ugHMO8uS3X6y99lrvetcWIQQelh2fTgZHh4dXnHMX8zx/cfuR7b1Yy/2H9gs/B9MP88tPTseXJ9PFxclkTCTlxaLTfX59tb8L8Pbt453Dw5O93sra6Nz28PlYMnqYz/Kg7KECZhqzi1QEJIuy5HQ0udjp9waj09Hgzddfu3Z8Mu6rt6/TSb9/6cxaC+SX3eTD/HKhovMuCBCKIBTz6ZT5rLpwdHh42QbRt0hOxxNuvX394sN8jgdpDw2wo5PJBWMdLghcABcEVV3TWL9T1+aSRVEZjwsSF8TDeowHbg8NMOP8QEiJlqAISAl1VTOfz/cQsi+8I440SI1+qH7+YO3hPapQuyGADAGJJ4RAYw3GmIvtLw6I4PFBosXDO6kftD20oB+cQYhAAAIShyDYQGMsznsIARAIKZHqoZ49D9Qe2pNq6XdkcIQATihcUDjv8D6glEIIgNazhPj/WQx79fXru39/7eXLx9Py0r33gg87cA+MFhAfPABJliOFuIcXQqoH8Rifi31mD3v99bcuvfnm2z+9e3TCrbsH/Kd//I//eb+TXG5MA95C8NzDRgRQSqG1JhAQUiwB/erEsN/Lw155853dg0l1AWA2ne9JHRNUwptv3+QXv3r1x6el26lrixACKQIiBCQBJUL7Wix9Lngg3HPAr4R9Kg975+adwc1bt65OZ/Pzt965wdrG1otx3qXrFPm8ZjKb8uorr5DnncudIkLHMaJsELQghRAQ0MavezXsVyh+waf0sKqs9oKQ53WaMZ5OeOv1Vy8u5vOLKxubaK2Jsw5Hxye8/trrzxjrEVIDSy8iQPCE4BFCvhvoQ8A7/8AX9rDsUwEmdDQQQiGFQuuYsjZM5iVawnpHEymJSgpuHx4zniwuesAvd1xAYIPAWP/ulgQIgYfJmDxo+3SAIYjjlDhKiOMUJRVluYDgGfQL8jwnTjLKsmQ8GRGWJU9oQzwutHmYFBIhJQLaVMPZh7G2h2KfCLBrf/M3O/tvvbNbdHv7WV4gQiCOE+I0o6oqytmE1WGPLE2J05wkLTg8OACWKUMA5wM+gGksUkmkalMJ7xzOOVwIFx7eMh+cfWzQ/xf/zb/eu3Ny+pNe8Rt+9MN/Ol4ddCgSCU6yiCJK6zk5GXFm4wkeWT3mdKqwLqEsA1FoiKTHyoAXCd7XmMUE7Apaa5yQBDy+rgAx+BzW+5ntYz2sHt3dK7SmWlTcvHvUl1lB1u0SacgiRawixtMFd09nrK1tsNLJyGKJEzCeVHihkcEjhMd7x3RRU9c1QijUMv+qfctofBXsYwHr9HroKCLLc6bjEVVZEicxSmukUsRJQmMMi8kYFcV0un2iOAVgcnqCUvp+OhECOOcwTU0Uxwgh2oDv/yM6JdfXVq51Oik6SZmXNe+8+RaL8YRuf4U0kmitcMDt0xnNoubRs9ucWR8ipedoPAUVE6sILSwCj0OxKCviNCOPNELApPHMSrv78Jf72e1jATv7tSef73czht2MLNYcH5/y9s1DqiZQ9Id0U0EcCebzKScnpxRpwrmz26wPcoIIVFVNmndI8EQKEI5FYxBAqjUyBEazkqPT2Vcihn1o0H/lN/uD27fv7nVXVgZJll/beuSxF8fTxcX5dELwnvl0wmxyysr6BnVVodUC5xqqckFT1/SGQwaDIbPZHGcNWVag9Jg4SUEonDWE4ImTGAQsZhNOD+/ucvbLj9mHAvY//S9/dWW0aC5mSUq3U7Dz+OM8sfMYt29cp6wqvFAcnk6I05TVYQ9rG4KzVA5GhwfE0TaPP7rJ/js3qaqSJM3pFV3SJMb4lkw0pmGwsoJ+5xYnR4fcORqd9z4MpBRf6u7Rh27JJoiLaZph0ByMF/zmjeucjmecPXuW9X7BIFUkCo4PDzk6ndAfrjHs5iAVo8mMo7t36XcK+p2cSAlsU1HkOZubW/S6Gc57nLVEkSZLYqyDyXTGoqy+9LnYhwLWyQu6RYc8z+l0Onjg9Vd/zXQ6Zfuxx9ncOkO3yMmylLIsqeuK3nCVSGt88MymM2ZlzWBljf5gAMHTNDUq0hR5gVaKpqpo6pJer4dWEeOTExbz+e7nu/xPbx8KWK/b+1mRpXSLgqLTISs6GC+4/uYbTI4OWVtbY31jgzRN0GnKfD4n+ECv1yP4QG0dJ8endLpdYi3pDYa44DB1Bc6hlMY5i3OOTrdP1ukxGY9ZzGef9/o/tX0oYNtntp5TWUGRSQaJoK8dnSylIeLN20dcv3mHKMvodgoKDd40TKYTYhFIii7WB0aLhno2RwmJlh4ZxVRVBQGiKOZeBZ7EEf3BKlonWGt3Puf1f2p7X9D/X//3f7c7W9S7WXeFra3Nl1Sw58vZBOccPgh8gOAdd+7cBm/Z3N5GxzHGOOaLktl0TJx28c5gjOHg4JDB6hrlfI5SEtfUECckacDiAIkksLExxJSnIMTOF4LCp7D7gP1X//Ivd28fHf+1CIJYKh59dIPv/eCPEd5zcOs6bVNW4gNA4OR0TPCOlZUBG9uPcOvG21SLCs0cKQRKCBZVQ95YkApbLgiADQGtJCqOkUIivSdPYHWYEyf5FwbEJ7X7gDlb7xa9HkJIgg+cTkpe/uU/sLV1ho0zj+CaivlsinWBENodZU3D6PSUXoDN7Uc5OjhgMp4glaLo9AjBUpVz8m4PgsfUdUtLh3C/LArBI4BOt0eaZftfHBSfzO4Dtr66SlxbXADvPUIlHI8nTKdjtjfW2T77CGtb21TzGaaqEHi0ACkCzWxMU9cMVjewHmbjEY2t6XZ7VPMJTTkn73SJoxgIVMa0DKJve5PB+2Vt+uWXQt0P+htb28/nnR5JllP0+sRJQhzFRHHCbDbh1ttvsZhNSdKMvNcnyXJUFKN0hI5ivPc0Vbk89TrUVYUxDXGS0tQlTblASLlkV8OyjUTbboOl1335NQP3PexHP/yD/b/6P3/xp3VV/URKiZQB29QIPASPR3Dnzl2KTpei6JBnCRqNcA2N9URxymI2wTiP1horJeV8ytr6BlaA965tuYXQAufce+jpQPB+2UX6ctt9wP78X/y3zzuVPLO2vnV9c33z3NfOnWE2GVFXC3zwOO/xARpjqE+Pmc0iil6PNCtAGMrJlPl8jvMBpRV50cHbGqUkWb+Hsx7vHMY1LQsm7qkFBN57nHME+NIXkxrgL//yf9hr4BnrHLdu3zy3mIxoFkecPfcEnZUOwRucafDOtQsFqrLk9PAQHcV0OgUyitG6xtY1zga8M6ysbxIrudxuEIJH6gjhDcEJhIRgHM75lvf/CtDUGiDr9QdFIzBBohB4Z7l7eMhoPKbX67K5tUW/10NKSV3OqasKby0BQVNbRs0pWRKRFl3SvENVLagXC6r5lLjXA9rTsPUmw72ekUDggyd4t+zEfflpVw2wtb56ZVY2f94EgQRE0FhSfPCM53PsrZs0VUm/30ewDNTOIV0AqfBAZSxRCHT7Q4puj2YxIUtTtJI4Y97TuFUE794jDhDLrF/wVWhPaoAffP/CvlDJnx6Ppz9xpgHAhbZTrYTAe8dkMqWpG9I0QWmN0BqpAj4I8AHvPdPxiKYuyZKUXr9Hkad4axACtFbYurkPlBBiqbuQKB0hHDhrv/TSTfHeJuo7R9Xu6ODO89PxyTlkglCKumnwPoAUiODwwQEgZdtbdL7dbmkUI6XEVAuCNRR5yuaZM0RaY5oa4wLWB6y1NM6B9wTrMR4a22Ct4fGz2+yc2/5Sawc0wEuvHwzuHJxcKut6ZzabXavK8tzORpdzT3wDZ9rWWLOYtqqbIBBS4YPE+EAIAmMNEkekNFGet/RzmmKCJHiPDwIpBdIbVPAoIbHBESQI71B4CI5FWdJ4dmPJ1U+6gH9/7Y1njw7u7E2m8/NeKOK8N15dGVx9+qmd5zZ70Sf+nk8F2C/+9t9eOR7NL1rfbjEXAm6es2gc3W6XbreDKgZIJbFNjQ8BqSNiJNZZGltTLioaWaO1blU7UqLrCpEkINqENSBASATL2uq9QV5I6qoiBC7AxwP27/7ulQs3b1y/spjPzyVpjpSKu7duMFnUfRHsn+z/sv8nTz759Rf+sx/+YO+BA1YUnR2h87YsQuBo/7xzfMrhyQlaCrI0ocgTYq1RWiGlbEsoQEpFt79ClCR4a9uE1FsWsylSKbRSy7qRd4FagtWmre0utNZSN/ZCkn10f/n/+r//bvflV9+80tRVf/ORRwneU3T7pEWPX738GxbzCfvv3EQo/czW2Z0Lm6udq50suaK0vvpAAHvyySefPTo+/amxloAkBI8K7r7uxodWg+Oco2wsonEoKdFKtYApT1VXGGsIrgVRSdBKEhAEIUG0HubbZKLVv4Z7YAmCUDSNYTad7/ay/u984J+/9MrOG9dvXWnQfZ0PQCUc3Nknny/YevRxeitrzMqSZPAIur/N8en0fC8R56Ng/iwtun8hlXr2MwP2nW9+7crxaP69xXz+3GI+v2iMWeZHAYEgzQq0jjCNIYSAs4aqLlmUC6wx+CCxVpDECTrRSy+zaN3yXcHb9ruEWArp3p9vtYB6jPGcHB2dG/Q7u3mirn7YA7/y2lvPz03oWxeom5JwcsL6I0/QNDWvvvIyh6dj8I7p8S1eOblBbp7iD7/7X/zzWIWrIPY/C1j3AQNYHRTXVgfF7vGkulDXzV4I/oJ3/qK1lki1XeooyfDOtYqdugTa0xLZyjCllDhrEQSU0mSdLkmaYkyDX27D8N568UPy1Nl0TLlYPJcn3V14//zR3/78l882dXUxhJYaUlHMbDxiPhljjKExhuADzjmKTpftzQ2++b3v/0WsxOUHJXMUH6fNunXncDCezC+cjMa7Ryenu03T5kpKxyRxhNYRSgYUHiklcaSRQhJpQbc/IElivHdY2yqonbW45WvnA9ZBYx1hKXsKpqHf73L2sUdf6g96u4mWI4C/+ftfX97ff/vH08rS2PbnrbX4ZarinMM6C87y6NY6f/gH333x7Pb63tqwt/9AkFraR0bX//Hf/PvdyXSyd3x8dMkL+nnRIUtisjQhSxWdJEKJAFKSFAOyNCNO4vZgkOBMjRD3ohS8G97ffac9XvzyU3AITsczzPUb54ezjSt1Y5598603nxuPJxdtkPgQWgnoUgbq7/F3BDIFZx89y+7uD//ikfXeZ4pVv8s+1MP+1X/33186nsyfc9adS7KUNMnIuz2SOCFNYyKt0VoSvENKgdYRcRThrEF4TxxHdHs9Ot2ijXGu9QRjHd55rHNYt/y79xhz73Oz9JqWlVVKMS9LytrgvMD4gGkM1hqc8xjnMdYTnCWSnm998ymefvrbL5xdy/ceBljwWx72b/7q/9j55a9+/Xw+WL149uvfIIvTVjinJDIE6rJt/Qdr8TKisR4XAtpYkroiSVLiOG7l5FLd7wy1J224n028r86+RyjSEoghCHwQWOvA+iUlLu4zwQBiqWm8958tBayuDPhH/+QPX1xN5UMD6wOAHc/qPRP3Lva3n+Q733gC6xzz2YTFfE7Z1FRNBcGjhUIHRSYB7/FCIeMUHSdLGYChnM9Js5Q2QLcgBJadp/cE4HuEqyDgXZvKOCRm2XDxQSAISCGQQuC4d2hI7g3mCG/YWukzSORzDxOsDwD21Leefu7g6N/u3r3x5sW/n95FRbrdckqSJjFFmi49RyKlQHiLkmCDwDUNtbPEkUZJ0eanSx2FD0tGVUAQ7YCDEBDupRn3wJMS4fwSIN49UZfUdVjOJ7UzSgJw9392besMfIIK4bPa+wD73jfPjv72P0RUxpEP1ljb2kYGjwo1vp5hradqDI0XRFHUKghdA0IhREyaZgg8pi7JsowQPMY07a6Toi2435dWhCW1H7iX97/3cBDcS0XanftecJ31QFujCjxZnl9X4uGPQX/glPzhD//4uX/4xT9w+/bNi9ViQpbEJLHG+0AcR8Ra0okUUmvqBhrRRYgA3rBYzMnyjKzbxwXPyeEBnf4ApRTeu7Y7RMB4eP/yP3x85r4GW7SBL7x3oEsKpPeE4EgjTSf+fDpOHwDs21/fvvLmL34+ulM1f51uZpx97DG63QKEpJzNqKqSYCqsscsI7vDetaMxcYyxlsV8ThxFFJ0uTW1wdtEmtoK20SHUMj6Fdw+B9zzD/WmR5Yvwnk/bhIL721YQWF9bodftXHvQ4Bwcnl4anx7vrWxs7q0OuqMPBQxg58lv7c/iOy82TX1xenrM7OQuPoRWGwEkWpN3u6RJjm4s5WKKElBXC4SQdDpd0iwjOEdVLjvhShKQKKWwXuKbuvW635eaDh6xbKAsm8APHLC6LHfHJ8d/IpV6dnXQvQwfk+n/1//yX12TcXE+6w45s7XB+qAgVm3pUVUN86rBWA/B3o9DkY7QcYJzluAcURQtfSKQpRkQMN5TlyVSKaRUGGPw3mOswxiH9R7r2k6SsbYt6pEY4zHWYKzHL9U/qRR8/4/+YPzdp7+2Ez9AMd7do/GlG2/f+GlTV3R7XR5//NHHizzb/8hM/+z25n7V2PP9lS5FFnNyckpdV1RVDcGxOuixWkQ4Usra4p3HGIOxFilbUXmwrg3+dd1O5bo22XXOkaQZ1tqPHtAKLX3k3fJ0RYEI+ODxIdDpD+itbfZnlbkSS57rpPGVzwrWndP5zi9/+cpPGw/BNogooaz95SJn7yM97Gi8GFSN23vlV78e3Lhx48frm2dYW18njlQ7yy3aU88HsDbgvFuSgAGhFE1d47y/X5gH74nTBOkdQkriJMVai3VLsH+Hh1kfCC5gjcc4S20NzlmkFKwPhmxtrNHvJXTyBCE0cRS/lGTplSSOnx900/1PC9jf/N0vLt+8ffDjRW0p8pxht2D7zAbf+Pqjw48tvgF+/g9v7Lx949ZbRdEhiyXSlggCqxtbRN0VnLFMTo6o66oVmQB1VVFXJd3hCklWUJdzoB2VEd6SZq1Sp92K9nduycbatm/pwDlPYwyNtyitSJKUbhKjseSpRuBQKiFJEuI4RklBURQvrKyuPre+1v/YGPfLl1+7VJXl7sHR6Z9VXnHr5i02NjZZGfQY5BHfO//Ujz7RvOQfPv3EfjcR/+Vrb+xfnp0257WO2NxcBx1TT08x1iGUJM0yXFNhmhrhaga9DmsbGzjnXhK2PB+CYFGX7/M4+CDx8t5zIIS2IJf3Cu7g0RKSSBFrgfSWLE3o9LokWUoIrUq7Khc4a5gtqmcm0/kzo9nGi6vrq5dXCn317qja7XSSa3cPxoOD27f3GtMMTFPvpnF0vjFtvHQ+UDWGIDWN9Szqlgv8xAOmTz75tSsBsV+ZcKVuzLnp6BhrHb1+j6ToIKqaaj6hqkq0kmxuP8L65uZYKr13fHi4m2f5+XI+I440cZIhpcAjEeG3xgF/GzyxPE6WcU5KiJOUNEtRUtBLc/r9HlGsQAqCD8RZhlaCuqpoqorReMzxyfHFt96I/lpHEXVdk2bZdeMZnJyc9L21xFpxZnsbpQJaexIpSZKMslzg6jl62GkJ0N93VvE/XHv1KkJc1KGhXJQ0TUOWpfQHQ7q9HiurwxciLZ8dn4wGVVm+ZazDNA3OebyQGGMAMKZ9z1lH49otabzH2nY2qbQO4xzaQ3CWEALFoEuaJPimpohisjSl6HWYzUZ4Y4miiCjNSLICnRZUZcliUTGbTZnNZsynU+q6Rqc5QmucaUiVoN/roAQ0xrFoHIcnYwQOESzf/e7T4x/+0bcHv/eQ/DeeOHfp8Pj0wsnhwZ6pqmcG/R7DYZf1tcH1PM/2pJZXWxexlz3ghSRIRQgCGwIe0UoEhFjKCJZl0Hu4sYBECUcQAR8kSkiKPCKPBFpD4yQKTxZDpCRSx9QosiwjkQHtG6QJDPsdttaHlNU6k9mCl166xrisEVWDsxalY4JQ3B7XSNHSVtga4Sp0MKyvr413zj22B5/hVoFBNxkNultXj3r5qK6qQZqmg6LIrsaRek5KeT8faoy/FEKr1xC0jINYilPeXxG1cgEpJAKPFKIFL3jwHq0UWZzR7eYo6VE6JlIRiWppJBUndHVMuvSWPMvw3lE3NaeHhzjrqYxnVtZM5wuaqsK4gHEO79sh2bYSaUutfpExXOnxzae+8eKZs2ef3VrrXoNPQFF/FnvjzRuX4jT/qTEGtzwJvbOY5WBD8A7nPY2xBO+pjcXa9oS0rv3MOgsiEImYTpEzXBlSLsZkRY8kTlt9WjVHSEWxsoErJzSzSUsHJSk6Kzi8fYvFbEHpBQ7FeNFQTieMZhWzuiZYQ1PNefyxc9fPPvbo890s5vGvPb6/sZJf/e0a9YHfjPKvf/a/XZqMTve8M7vf/PZ3+tuPZIjgiCOBaRxCtjqMIO5tvpbzCUiEUHDv3RBQArI8J04igrF0OylZGjGfOpxxJMMerp7hqzmjkxPG85oi6zKbOWblgtqPQEiMtVSLOZULzMoSjyQJnrVhl16lMdWCfDXlH/+TP9g//9Rjlz9qfQ8EsP/5r/+f3f13buyNRqNLIPoBOLO+QtHrE6mWE2slAwHj3suaLmOVEPeLcR9ashAlkFIzHAzQWnF0eBchBcFZJJLxbIHu1MQsR6Md7O9fR8YR/cEK87Kidp7FbEYIkCjddpVqw3w+Y940fP+f/ejFYVfte+d2ts5sXVtbX/tYAvL3BuzlV69fuHnz1t7p8cGlo/HsXGUFWVa02lcdsbLaJ+/28K5ph+GdW16/4H/3LQJCtHFOCYTQ6CgiilOCN3jniJIEIVuB3nh0wmw2YX3YJ000wbddq+noFGsN/f4q5WyK957ZdIJPUorecDkNLMjygvWt7atP7qxc/jTr/lSAvfHWO4O7B0d74/FkbzxbnC+Nx4eYojNgRQvQKUForLMc3LiOKMd86zvfJpISJWOsc4AmCLNMQ+/JB1ielgEhIcmyVl8rIMszqkkNWrdyUKWRwKKqOT56h0ju8Mj6Gl7Ilve3jlxovv2Np144uH179+jg9rlFLHn0zJnxk9/6xl5VloP5dLKT9/qjx7Z7z3+a9X9iwH71m+u7R4eHe5PZ4pm6aQgIdJLRSyVRFCEFmGqOQzGrGqbjU7zzhLjDwkCqbNtpCg2RFswalk2N0DKm1hOsQQtovEUrgReBqpwjfIMSFpwjmBpd5O3lWsGgZWDY6407Rd5Px2OKWLJ1bo3vfuvpl87trO/xxDqz2X9yoXFuMCiyfanV/qcF6FMB9vIrr++WZXl5Ni8vGuPQUYyMkndntUVbGzZ1TZARZVVT1w2dXr+d6ZaKOzffYXt7qxWlRIqmKoFW0aM0mKZpewZph7qs8LYmjSNMuaCpFjjbEMeazbVVth977GdFll4juD3S4pxUT46//sTjzxaxvjLc3Lwwqy1FqtgYdK7eW0On82B5sg9NK65fv7kzPj153jh/0QdQaQehEmbzOYvZFLNkC2xTt9tJamZlg7WOLC/QUUzwDq0g1ZL1lT79Xpc0ltTzCQsbARBFEXU5QwhJ3uszOTni9OiQ1Y1NppMJ3nueevrpF7p5PJAyvlqk6qF3hT7OPuBh79y489x0Mv4zdEyRJ6goIu90aRqDLUfMbYlrTJu1q6g93awnFoJeJyVNJLgGExoileGtZTar8SKm0+nSNBHz6Zj+cEiyLNbTLGV9fe2FSDAS3u5mabqDc/206NLt5M930wcvjPt97f2SzRt3rlRV9SdITZp3UErhrGU8GTMZjyjLEu8CLggaH6jqBqQkmIYiS4m0xlqDMQ1aK6TU1I1Zqq1LNje3WF1ZYXx0QGMaghR0ekMePbtFnmU/S+Lo2Txp48xoWu4kSUwWf/a48yDtPmC3D06enc/mfx6nOXGWMx2PmY9H1OWcad1gfEAJhfBtallZjw2BuirJYsX6cEBjLFXTpgBCgm0afFBYBLPJiFgLzj99HoHg5PiAG3dvY5znO088xsbmGeK4w7CjXozS5BLiyzn7fX9LJkkysNYzOjliNp0ilEI4h/ceLSUOcNYt210Sa1sJk/CGjdV1BoM+TdUwnc8x1lLXLfMalnJymWTU9YLxdMJgMCTvDehVDYeHR9w+neP0mJUeDDu9i/DJZJtfhN2fhlrpF5fL+Wy4mE9fStK0lZZLQRTH9AZDOt0BOkrwiJazF+DqBYM8Y7XfpZsndIuCPInREkTwRFGMjhKqxjBflAQVM5rOODk5Yjafg4c4yZjVgeu3T7h1+20mZXMdIa5+gZh8pN33sF9c+8WgaczVvOied+0UKUnS6iVEnFGfnOKcbW/IVBprapxrqeYoydqmR7DLtr5AaU2wbSvsHgMqSTk5vIuZp2RFF+9bPUWzWOCcJQ8Rpwd3zw373V2plvTQl8w0wKuvvHohSfOreS/pOx/wPpD0+mRKsJgtOD0+YDqeYexywD20W3VjbY0zG+vEGiItqfBI0TZ3szSlqmqaulmORQq8D9SNI1Ahoxwp26w9CI0PAScj3rp9SDpYe+7s1sqXcu5Iv/7yy4O807uq4rTfdn8cLoBtKu4cHUCAum4HQoNzoBRKShrbEHUy+oM+QXiCECAlaZ5jnSWINuZFNqAJpFFMb7llK+dxQRApQZQoIpkisgwbaiaV49W33jm/sjbcy7V4/osG6LdNRklyISuKfhTHZEVBFCfoKGJ0dIA1zZLXa/l0Hcc457HGLIVyDh1F2Kamqqr2IjWtSYsOWmm01ijZNjyU1qRZTpJmbZM3tGOCSiqUUijdRgelFJPxiMWiufwF4vI7TW6cObPf6XZfzLLsJa0VaZYyPrr7ogCyooNUUSvoXerr9fLuVbGkZKSOqRtDVVUoHbW9xyhCaQXBESmBEoFYCTpZQqQE3kuCt2RxhPu4rN0AAAU6SURBVI41iQjkWgASHSWMxhNeefPtc8GY3S8Ynw+YzLJsP4nUbpHqC70sEke3bw6D94Nur4/3gaaucCEglGxvA1ASJUBJhYgSqiCYzcu2zpQKaxqqxQwJaNnGNrEELopUOyuJJzhDLB3WgwgNatkUXutm4Czv3LjFrVG990UD9Nv2gSHrEMJzveHK+eACSmu6/WUJYy11VeKNRUtFFCc4a7lz6zazyZg8y9smondLfaokSVOkakdlsjwnipNWpk6gKApi3cqooigmThKUFHTznCLNuHl9nzdff23384fko+19gL32m9cu94bDZ5y1REnC6uY2ebfX8u8hIKWkNxi0mv0oxnnPzbffomkalI4wdY01DWp5IaTWUTt3pBR5p0McxwTaPuRgMCCOI7wP6Cheasg8/SIjSxPm8ynHk+m5LwSVj7D7gL32yqs7/dW1H4dA61ndDs4ZpuMRwlvi4FhdGS6HXxzemVbhJmNCkAhncTiqkGGjPt04Jo3aiyGjvMtqJyaWDodE44jjiLpcoAVEWoA3CG+pEASlkFIQhS/fdaX3E9f+ysrlKE5wVUUcx5imZjad0TQ1UmkGq2tEccpkdHJfF690q5uXkWJS1pRVgzMVaTwgTRW+LFFMWRsOGK6uMRmPEATSJMIjWCxqJJ4kSRFSsrCKmzdvsbKywj/70e4L57a39r9AbD7U7gOWF90dF9qUoZzP4V46sLwYstNfYTo6bbcZi5ZplZKgAs577ty+TWMNcRSTxhqp2861xpOlMXGUoEQ7+DXoD0AqxvOKLMvo9AfU5YJZ5fn5z/9fvnf+2/zTP/7B84n68tWT97dkFOtnkyS5LrwjijRJmrYKaO+QQjIbnaCVgGDpFDkrwyGxDPS7HYRSTBYl80VNHkekur36XUaaNJb0ilaNeO/qUY3De5hWHqFjZJKDSlgfdllbGXBue4VENQ9cUfgg7F22IlLXgB2t5KA7WNufTOd9aAP9YjYFIej2BsSRpjdcxVmLxKPiCFOBMZZIK6yD2gTiSCFUhFcRIs2pqhJoJQG1E7jZjDQSSFNy841fU3T7/Oc/+OZfJPk/uqIk+/DlpHc+kFYkWX7BO9e/N8JxT0m/snEGHzx5p0d3MCR4T5p3ljeVC6SSxHHSXpNsLU1jCN4haBU1zhhUFI8FYjydjJmMTugPV8fdwfCFxWJBlKTX807ncqzFVSU/+5jew7IPUNRFp7jW1NVYSfpplpJ3u0gpX8zS9KI3NVmWoZajojqOMI0nkrC5vo6II66/fZuKiK8/sooUmnltObh+nbVMcObc489jq2u1jX6iQsP3v/fUc/1Odhm+s/f5L/33sw8AFkdqpESyK5W+JHVEY9wVKcSlQLgoCOR5TrWYk6QZxlpEgCjWdAZDxpMTJvM5B4cHPL7xR+MkL/aFc+fL2YT+yur4zNrg8pn14ejxWX0titQgifWXMk59lH1om01pfS3X7WLSSDI+tc8iFYTA7Xf20VozWN/CzKZIpXF2TlPOCN6SKEh7HXq97pUguNrvdX8y3Njm3Nnh7j3aud9JvnJA3bNP1vkOfscZj3OW06NDBivLGzWdbynsKCKKo7G2ut/v5Dyy8wSDYf+ylGK/0x9cCzDSiv2Hu5TPxz7RhV1xFF1TWhMnKYOVVeI0H1vv2ysVpGJlbWP8yPb27trK2s++8+Tj17++PfxTuQzcieJa+h8JWPAJ9WG1cQPn/LPLf3llfHq6b63dF0L2ldbj4XC4myXqK7vNPo393oK6yXh6IUqSS1LKK1/F4P372v8Hd1kwaRzkSZwAAAAASUVORK5CYII="
        id="image0_600_796"
        width={76}
        height={99}
      />
    </defs>
  </svg>
);

export default CardBack;
